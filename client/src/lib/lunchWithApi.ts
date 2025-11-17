import type { Character, Scene, Cast, Story, StoryCast, InsertCharacter, InsertScene, InsertCast, InsertStory } from "@shared/api-types";

// Use backend proxy to avoid CORS issues in the browser
const API_BASE_URL = "/api/lunchwith";
const API_KEY_STORAGE_KEY = "lunchwith_api_key";

class LunchWithAPIClient {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }

  private async request<T>(
    endpoint: string,
    method: string,
    body?: any
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("API key not set. Please configure your API key.");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": this.apiKey,
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    // Handle empty responses (like successful DELETE)
    const text = await response.text();
    if (!text) {
      return null as T;
    }

    const data = JSON.parse(text);
    
    // LunchWith.ai API wraps responses in a results field
    if (data && typeof data === 'object' && 'results' in data) {
      // For single item responses, return the first item from results array
      // For collection responses, return the results array
      const results = data.results;
      if (Array.isArray(results)) {
        // Check if this is a specific resource endpoint (has an ID in the path)
        // Patterns:
        // - /scene/{id} or /character/{id} = single resource
        // - /cast/{scene_id}/{cast_id} = single cast member
        // - /cast/{scene_id} = list of cast (NOT single resource)
        const uuidPattern = /[a-f0-9-]{36}/gi;
        const uuidMatches = endpoint.match(uuidPattern);
        
        // For cast endpoints: only treat as specific resource if there are TWO UUIDs
        // For other endpoints: treat as specific resource if there's ONE UUID at the end
        const isCastEndpoint = endpoint.includes('/cast/');
        const isSpecificResource = isCastEndpoint 
          ? (uuidMatches && uuidMatches.length === 2)
          : endpoint.match(/\/[a-f0-9-]{36}$/i);
        
        // If results is an array with one item and we're either:
        // 1. Using PUT/POST methods, or
        // 2. Getting a specific resource by ID
        // Then return just that single item. Otherwise return the array.
        return (results.length === 1 && (method === 'PUT' || method === 'POST' || isSpecificResource)
          ? results[0] 
          : results) as T;
      }
      return results as T;
    }
    
    return data as T;
  }

  // Character endpoints
  async getCharacters(): Promise<Character[]> {
    return this.request<Character[]>("/character/", "GET");
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    return this.request<Character>("/character/", "PUT", character);
  }

  async updateCharacter(characterId: string, character: Partial<Character>): Promise<Character> {
    return this.request<Character>(`/character/${characterId}`, "POST", character);
  }

  async deleteCharacter(characterId: string): Promise<void> {
    return this.request<void>(`/character/${characterId}`, "DELETE");
  }

  // Scene endpoints
  async getScenes(): Promise<Scene[]> {
    return this.request<Scene[]>("/scene", "GET");
  }

  async createScene(scene: InsertScene): Promise<Scene> {
    return this.request<Scene>("/scene", "PUT", scene);
  }

  async updateScene(sceneId: string, scene: Partial<Scene>): Promise<Scene> {
    return this.request<Scene>(`/scene/${sceneId}`, "POST", scene);
  }

  async deleteScene(sceneId: string): Promise<void> {
    return this.request<void>(`/scene/${sceneId}`, "DELETE");
  }

  async getScene(sceneId: string): Promise<Scene> {
    return this.request<Scene>(`/scene/${sceneId}`, "GET");
  }

  // Cast endpoints
  async getCastMembers(sceneId: string): Promise<Cast[]> {
    return this.request<Cast[]>(`/cast/${sceneId}`, "GET");
  }

  async createCast(sceneId: string, cast: InsertCast): Promise<Cast> {
    return this.request<Cast>(`/cast/${sceneId}`, "PUT", cast);
  }

  async updateCast(sceneId: string, castId: string, cast: Partial<Cast>): Promise<Cast> {
    return this.request<Cast>(`/cast/${sceneId}/${castId}`, "POST", cast);
  }

  async deleteCast(sceneId: string, castId: string): Promise<void> {
    return this.request<void>(`/cast/${sceneId}/${castId}`, "DELETE");
  }

  // Story endpoints
  async getStories(): Promise<Story[]> {
    return this.request<Story[]>("/story/", "GET");
  }

  async getStory(storyId: string): Promise<Story> {
    return this.request<Story>(`/story/${storyId}`, "GET");
  }

  async createStory(storyId: string, startSceneId: string, story: InsertStory): Promise<Story> {
    // Step 1: Create story by setting its start scene (POST with no body)
    await this.request<Story>(`/story/${storyId}/start_scene/${startSceneId}`, "POST");
    
    // Step 2: Update the story with name and description
    const result = await this.request<Story>(`/story/${storyId}`, "POST", story);
    return result;
  }

  async updateStory(storyId: string, story: Partial<Story>): Promise<Story> {
    return this.request<Story>(`/story/${storyId}`, "POST", story);
  }

  async deleteStory(storyId: string): Promise<void> {
    return this.request<void>(`/story/${storyId}`, "DELETE");
  }

  // Set start scene for a story
  async setStoryStartScene(storyId: string, sceneId: string): Promise<Story> {
    return this.request<Story>(`/story/${storyId}/start_scene/${sceneId}`, "POST");
  }

  // Link a character to a cast member in a story
  async linkCharacterToCast(storyId: string, characterId: string, castId: string): Promise<StoryCast> {
    return this.request<StoryCast>(`/story/${storyId}/cast/${characterId}/as/${castId}`, "POST");
  }

  // Get all cast links for a story
  async getStoryCastLinks(storyId: string): Promise<StoryCast[]> {
    return this.request<StoryCast[]>(`/story/${storyId}/cast`, "GET");
  }

  // Remove a character from a story cast
  async unlinkCharacterFromCast(storyId: string, castId: string): Promise<void> {
    return this.request<void>(`/story/${storyId}/cast/${castId}`, "DELETE");
  }
}

export const apiClient = new LunchWithAPIClient();
