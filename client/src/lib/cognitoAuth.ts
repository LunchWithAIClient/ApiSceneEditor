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
  USER_POOL_ID: 'cognito_user_pool_id',
  CLIENT_ID: 'cognito_client_id',
  USERNAME: 'cognito_username',
  USER_ID: 'cognito_user_id',
};

export interface CognitoConfig {
  userPoolId: string;
  clientId: string;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface AuthUser {
  username: string;
  userId: string; // LWAI user_id extracted from Cognito attributes
}

class CognitoAuthService {
  private userPool: CognitoUserPool | null = null;
  private currentUser: CognitoUser | null = null;
  private config: CognitoConfig | null = null;

  constructor() {
    // Try to restore config from localStorage
    const userPoolId = localStorage.getItem(STORAGE_KEYS.USER_POOL_ID);
    const clientId = localStorage.getItem(STORAGE_KEYS.CLIENT_ID);
    
    if (userPoolId && clientId) {
      this.initializeUserPool({ userPoolId, clientId });
    }
  }

  /**
   * Initialize Cognito User Pool with configuration
   */
  initializeUserPool(config: CognitoConfig) {
    this.config = config;
    this.userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.clientId,
    });

    // Persist configuration
    localStorage.setItem(STORAGE_KEYS.USER_POOL_ID, config.userPoolId);
    localStorage.setItem(STORAGE_KEYS.CLIENT_ID, config.clientId);
  }

  /**
   * Get current configuration
   */
  getConfig(): CognitoConfig | null {
    return this.config;
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

          // Extract user_id from ID token payload
          const idTokenPayload = session.getIdToken().payload;
          const userId = idTokenPayload['custom:user_id'] || idTokenPayload.sub;

          const user: AuthUser = {
            username,
            userId,
          };

          // Store username and user_id for session persistence
          localStorage.setItem(STORAGE_KEYS.USERNAME, username);
          localStorage.setItem(STORAGE_KEYS.USER_ID, userId);

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

        // Get stored user info
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || '';
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID) || session.getIdToken().payload.sub;

        const user: AuthUser = {
          username,
          userId,
        };

        resolve({ tokens, user });
      });
    });
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
  }

  /**
   * Clear all stored configuration and auth data
   */
  clearConfig() {
    this.signOut();
    this.userPool = null;
    this.config = null;
    localStorage.removeItem(STORAGE_KEYS.USER_POOL_ID);
    localStorage.removeItem(STORAGE_KEYS.CLIENT_ID);
  }
}

export const cognitoAuth = new CognitoAuthService();
