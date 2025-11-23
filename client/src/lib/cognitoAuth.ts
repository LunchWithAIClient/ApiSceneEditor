/**
 * AWS Cognito Authentication Service
 * 
 * Manages authentication using AWS Cognito User Pools
 * Handles sign-in, token management, and session persistence
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

// LocalStorage keys for persisting auth data
const STORAGE_KEYS = {
  USERNAME: 'cognito_username',
  USER_ID: 'cognito_user_id',
  AVAILABLE_USER_IDS: 'cognito_available_user_ids',
  SELECTED_USER_ID_INDEX: 'cognito_selected_user_id_index',
};

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface AuthUser {
  username: string;
  userId: string; // Currently selected LWAI user_id
  availableUserIds: string[]; // All available LWAI user IDs from Cognito
}

class CognitoAuthService {
  private userPool: CognitoUserPool | null = null;
  private currentUser: CognitoUser | null = null;

  constructor() {
    // Initialize from environment variables
    const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    
    if (userPoolId && clientId) {
      this.userPool = new CognitoUserPool({
        UserPoolId: userPoolId,
        ClientId: clientId,
      });
    }
  }

  /**
   * Extract all LWAI user IDs from Cognito ID token payload
   * Priority: custom:lwai_accounts → custom:user_id → sub
   * Returns array of all available user IDs
   */
  private extractAllLwaiUserIds(idTokenPayload: any): string[] {
    // First, check custom:lwai_accounts (primary source)
    const lwaiAccounts = idTokenPayload['custom:lwai_accounts'];
    if (lwaiAccounts) {
      // Handle different formats:
      // - Single string: "1106072e-fa0f-44f4-8c0a-54661c8411e1"
      // - Comma-delimited: "id1,id2,id3"
      // - JSON array: "[\"id1\",\"id2\"]"
      
      if (typeof lwaiAccounts === 'string') {
        const trimmed = lwaiAccounts.trim();
        
        // Try parsing as JSON array
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed;
            }
          } catch (e) {
            console.warn('Failed to parse custom:lwai_accounts as JSON:', e);
          }
        }
        
        // Handle comma-delimited or single value
        const accounts = trimmed.split(',').map(s => s.trim()).filter(s => s);
        if (accounts.length > 0) {
          return accounts;
        }
      } else if (Array.isArray(lwaiAccounts) && lwaiAccounts.length > 0) {
        return lwaiAccounts;
      }
    }
    
    // Fallback to custom:user_id
    const customUserId = idTokenPayload['custom:user_id'];
    if (customUserId) {
      return [customUserId];
    }
    
    // Last resort: use Cognito sub
    const sub = idTokenPayload.sub;
    console.warn('⚠️ LWAI account ID not found in Cognito token. Using Cognito sub which may not work correctly.');
    return [sub];
  }

  /**
   * Check if user pool is configured
   */
  isConfigured(): boolean {
    return this.userPool !== null;
  }

  /**
   * Sign in with username and password
   */
  async signIn(username: string, password: string): Promise<{ tokens: AuthTokens; user: AuthUser }> {
    if (!this.userPool) {
      throw new Error('Cognito User Pool not configured');
    }

    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session: CognitoUserSession) => {
          this.currentUser = cognitoUser;
          
          const tokens: AuthTokens = {
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
          };

          // Extract all LWAI user IDs from ID token payload
          const idTokenPayload = session.getIdToken().payload;
          const availableUserIds = this.extractAllLwaiUserIds(idTokenPayload);
          
          // Get selected index from localStorage (default to 0, handle NaN/invalid)
          const storedIndex = parseInt(localStorage.getItem(STORAGE_KEYS.SELECTED_USER_ID_INDEX) || '0', 10);
          const selectedIndex = isNaN(storedIndex) ? 0 : storedIndex;
          const safeIndex = Math.min(Math.max(0, selectedIndex), availableUserIds.length - 1);
          const userId = availableUserIds[safeIndex];

          const user: AuthUser = {
            username,
            userId,
            availableUserIds,
          };

          // Store auth data for session persistence
          localStorage.setItem(STORAGE_KEYS.USERNAME, username);
          localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
          localStorage.setItem(STORAGE_KEYS.AVAILABLE_USER_IDS, JSON.stringify(availableUserIds));
          localStorage.setItem(STORAGE_KEYS.SELECTED_USER_ID_INDEX, safeIndex.toString());

          resolve({ tokens, user });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * Get current authenticated user from session
   */
  async getCurrentSession(): Promise<{ tokens: AuthTokens; user: AuthUser } | null> {
    if (!this.userPool) {
      return null;
    }

    const cognitoUser = this.userPool.getCurrentUser();
    if (!cognitoUser) {
      return null;
    }

    return new Promise((resolve, reject) => {
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          resolve(null);
          return;
        }

        this.currentUser = cognitoUser;

        const tokens: AuthTokens = {
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        };

        // Get username from localStorage
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || '';
        
        // Extract all LWAI user IDs from ID token (always fresh from token)
        const idTokenPayload = session.getIdToken().payload;
        const availableUserIds = this.extractAllLwaiUserIds(idTokenPayload);
        
        // Get selected index from localStorage (default to 0, handle NaN/invalid)
        const storedIndex = parseInt(localStorage.getItem(STORAGE_KEYS.SELECTED_USER_ID_INDEX) || '0', 10);
        const selectedIndex = isNaN(storedIndex) ? 0 : storedIndex;
        const safeIndex = Math.min(Math.max(0, selectedIndex), availableUserIds.length - 1);
        const userId = availableUserIds[safeIndex];
        
        // Update localStorage with the latest values
        localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        localStorage.setItem(STORAGE_KEYS.AVAILABLE_USER_IDS, JSON.stringify(availableUserIds));
        localStorage.setItem(STORAGE_KEYS.SELECTED_USER_ID_INDEX, safeIndex.toString());

        const user: AuthUser = {
          username,
          userId,
          availableUserIds,
        };

        resolve({ tokens, user });
      });
    });
  }

  /**
   * Switch to a different LWAI user account
   * @param index Index of the user ID in the availableUserIds array
   */
  switchUserAccount(index: number) {
    const availableUserIds = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.AVAILABLE_USER_IDS) || '[]'
    );
    
    if (index < 0 || index >= availableUserIds.length) {
      throw new Error('Invalid user account index');
    }
    
    const userId = availableUserIds[index];
    localStorage.setItem(STORAGE_KEYS.SELECTED_USER_ID_INDEX, index.toString());
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }

  /**
   * Sign out current user
   */
  signOut() {
    if (this.currentUser) {
      this.currentUser.signOut();
    }
    
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.AVAILABLE_USER_IDS);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_USER_ID_INDEX);
  }

}

export const cognitoAuth = new CognitoAuthService();
