/**
 * LunchWith.ai API Client
 * 
 * This client provides a typed interface to interact with the LunchWith.ai API.
 * All requests go through a backend proxy to avoid CORS issues.
 * 
 * Key features:
 * - Cognito token-based authentication
 * - X-LWAI-User-Id header for user identification
 * - Automatic response unwrapping (handles LunchWith.ai's "results" wrapper)
 * - Type-safe methods for all CRUD operations
 * - Comprehensive error handling
 */

import type { Character, Scene, Cast, InsertCharacter, InsertScene, InsertCast, UserProfile, UserAccountProfile } from "@shared/api-types";
import { cognitoAuth } from "./cognitoAuth";

// Backend proxy endpoint - all requests are forwarded through our Express server
const API_BASE_URL = "/api/lunchwith";

// Callback for handling session expiration
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

/**
 * LunchWith.ai API Client Class
 * Manages authentication and communication with the LunchWith.ai API using Cognito tokens
 */
class LunchWithAPIClient {
  /**
   * Generic request method for all API calls
   * Handles authentication, response parsing, and LunchWith.ai response unwrapping
   * 
   * @param endpoint - API endpoint path (e.g., "/character/", "/scene/{id}")
   * @param method - HTTP method (GET, POST, PUT, DELETE)
   * @param body - Optional request body for POST/PUT requests
   * @returns Parsed response data with appropriate typing
   * 
   * LunchWith.ai API Response Format:
   * The API wraps all responses in a "results" array field.
   * This method unwraps single-item responses based on:
   * - HTTP method (PUT/POST typically return single items)
   * - URL pattern (endpoints with resource IDs expect single items)
   * Multi-item responses are returned as arrays.
   */
  private async request<T>(
    endpoint: string,
    method: string,
    body?: any
  ): Promise<T> {
    // Get current session to extract tokens and user info
    const session = await cognitoAuth.getCurrentSession();
    
    if (!session) {
      throw new Error("Not authenticated. Please sign in.");
    }

    // Setup request headers with Cognito token
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.tokens.accessToken}`,
    };
    
    // Only include X-LWAI-User-Id for non-user-discovery endpoints
    // The /user/me endpoint uses the JWT token to determine identity
    if (!endpoint.startsWith('/user/me')) {
      headers["X-LWAI-User-Id"] = session.user.userId;
      console.log(`📤 API Request: ${method} ${endpoint} with User-Id: ${session.user.userId}`);
    } else {
      console.log(`📤 API Request: ${method} ${endpoint} (discovery mode, no User-Id header)`);
    }

    const config: RequestInit = {
      method,
      headers,
    };

    // Include request body for POST/PUT requests
    if (body) {
      config.body = JSON.stringify(body);
    }

    // Make the request through our backend proxy
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      
      // If unauthorized, trigger session expiration handler
      if (response.status === 401) {
        if (onSessionExpired) {
          onSessionExpired();
        }
        throw new Error("Session expired. Please sign in again.");
      }
      
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    // Handle empty responses (like successful DELETE operations)
    const text = await response.text();
    if (!text) {
      return null as T;
    }

    const data = JSON.parse(text);
    
    // Debug logging for scene endpoint
    if (endpoint.includes('/scene')) {
      console.log("🔍 Raw API response for", endpoint, ":", data);
    }
    
    /**
     * LunchWith.ai API Response Unwrapping Logic
     * 
     * The API returns responses wrapped in a "results" array:
     * { results: [...] }
     * 
     * This logic determines whether to return:
     * 1. A single object (for specific resource requests)
     * 2. An array of objects (for collection requests)
     */
    if (data && typeof data === 'object' && 'results' in data) {
      const results = data.results;
      if (Array.isArray(results)) {
        // Detect if this is a specific resource request by examining the endpoint
        // Pattern matching:
        // - /scene/{uuid} or /character/{uuid} = single resource
        // - /cast/{scene_uuid}/{cast_uuid} = single cast member (2 UUIDs)
        // - /cast/{scene_uuid} = list of cast (1 UUID, NOT single resource)
        const uuidPattern = /[a-f0-9-]{36}/gi;
        const uuidMatches = endpoint.match(uuidPattern);
        
        // Special handling for cast endpoints which have scene_id in path
        const isCastEndpoint = endpoint.includes('/cast/');
        const isSpecificResource = isCastEndpoint 
          ? (uuidMatches && uuidMatches.length === 2) // Cast needs 2 UUIDs (scene + cast)
          : endpoint.match(/\/[a-f0-9-]{36}$/i); // Others need 1 UUID at end
        
        // Return logic:
        // - Single item + (create/update OR specific resource) = unwrap to object
        // - Otherwise = return array
        return (results.length === 1 && (method === 'PUT' || method === 'POST' || isSpecificResource)
          ? results[0] 
          : results) as T;
      }
      return results as T;
    }
    
    return data as T;
  }

  // ============================================================================
  // CHARACTER ENDPOINTS
  // ============================================================================

  /**
   * Retrieves all characters
   * @returns Array of all characters
   */
  async getCharacters(): Promise<Character[]> {
    return this.request<Character[]>("/character/", "GET");
  }

  /**
   * Retrieves a specific character by ID
   * @param characterId - UUID of the character
   * @returns Single character object
   */
  async getCharacter(characterId: string): Promise<Character> {
    return this.request<Character>(`/character/${characterId}`, "GET");
  }

  /**
   * Creates a new character
   * Note: LunchWith.ai uses PUT for creating resources
   * @param character - Character data (without ID)
   * @returns Newly created character with generated ID
   */
  async createCharacter(character: InsertCharacter): Promise<Character> {
    return this.request<Character>("/character/", "PUT", character);
  }

  /**
   * Updates an existing character
   * Note: LunchWith.ai uses POST for updating resources
   * @param characterId - UUID of the character to update
   * @param character - Partial character data to update
   * @returns Updated character object
   */
  async updateCharacter(characterId: string, character: Partial<Character>): Promise<Character> {
    return this.request<Character>(`/character/${characterId}`, "POST", character);
  }

  /**
   * Deletes a character
   * @param characterId - UUID of the character to delete
   */
  async deleteCharacter(characterId: string): Promise<void> {
    return this.request<void>(`/character/${characterId}`, "DELETE");
  }

  // ============================================================================
  // SCENE ENDPOINTS
  // ============================================================================

  /**
   * Retrieves all scenes
   * @returns Array of all scenes
   */
  async getScenes(): Promise<Scene[]> {
    return this.request<Scene[]>("/scene", "GET");
  }

  /**
   * Creates a new scene
   * Note: LunchWith.ai uses PUT for creating resources
   * @param scene - Scene data (without ID)
   * @returns Newly created scene with generated ID
   */
  async createScene(scene: InsertScene): Promise<Scene> {
    return this.request<Scene>("/scene", "PUT", scene);
  }

  /**
   * Updates an existing scene
   * Note: LunchWith.ai uses POST for updating resources
   * @param sceneId - UUID of the scene to update
   * @param scene - Partial scene data to update
   * @returns Updated scene object
   */
  async updateScene(sceneId: string, scene: Partial<Scene>): Promise<Scene> {
    return this.request<Scene>(`/scene/${sceneId}`, "POST", scene);
  }

  /**
   * Deletes a scene and all associated cast members
   * @param sceneId - UUID of the scene to delete
   */
  async deleteScene(sceneId: string): Promise<void> {
    return this.request<void>(`/scene/${sceneId}`, "DELETE");
  }

  /**
   * Retrieves a specific scene by ID
   * @param sceneId - UUID of the scene
   * @returns Single scene object
   */
  async getScene(sceneId: string): Promise<Scene> {
    return this.request<Scene>(`/scene/${sceneId}`, "GET");
  }

  // ============================================================================
  // CAST MEMBER ENDPOINTS
  // ============================================================================

  /**
   * Retrieves all cast members for a specific scene
   * @param sceneId - UUID of the scene
   * @returns Array of cast members in the scene
   */
  async getCastMembers(sceneId: string): Promise<Cast[]> {
    return this.request<Cast[]>(`/cast/${sceneId}`, "GET");
  }

  /**
   * Creates a new cast member in a scene
   * Note: LunchWith.ai uses PUT for creating resources
   * @param sceneId - UUID of the scene
   * @param cast - Cast member data (without ID, but includes scene_id)
   * @returns Newly created cast member with generated ID
   */
  async createCast(sceneId: string, cast: InsertCast): Promise<Cast> {
    return this.request<Cast>(`/cast/${sceneId}`, "PUT", cast);
  }

  /**
   * Updates an existing cast member
   * Note: LunchWith.ai uses POST for updating resources
   * @param sceneId - UUID of the scene
   * @param castId - UUID of the cast member to update
   * @param cast - Partial cast member data to update
   * @returns Updated cast member object
   */
  async updateCast(sceneId: string, castId: string, cast: Partial<Cast>): Promise<Cast> {
    return this.request<Cast>(`/cast/${sceneId}/${castId}`, "POST", cast);
  }

  /**
   * Deletes a cast member from a scene
   * @param sceneId - UUID of the scene
   * @param castId - UUID of the cast member to delete
   */
  async deleteCast(sceneId: string, castId: string): Promise<void> {
    return this.request<void>(`/cast/${sceneId}/${castId}`, "DELETE");
  }

  // ============================================================================
  // USER PROFILE ENDPOINTS
  // ============================================================================

  /**
   * Retrieves current user's identity and accessible accounts
   * @returns User profile with identity and accounts list
   */
  async getUserProfile(): Promise<UserProfile> {
    return this.request<UserProfile>("/user/me", "GET");
  }

  /**
   * Retrieves account-specific profile and preferences for a specific user_id
   * @param userId - UUID of the user account
   * @returns User account profile with identity and preferences
   */
  async getUserAccount(userId: string): Promise<UserAccountProfile> {
    return this.request<UserAccountProfile>(`/user/me/${userId}`, "GET");
  }
}

// Export singleton instance for use throughout the application
export const apiClient = new LunchWithAPIClient();
