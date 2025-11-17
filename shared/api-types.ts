export interface Character {
  character_id: string;
  name: string;
  description: string;
  motivation: string;
}

export interface Scene {
  scene_id: string;
  name: string;
  description: string;
}

export interface Cast {
  cast_id: string;
  scene_id: string;
  role: string;
  goal: string;
  start: string;
}

export interface Story {
  story_id: string;
  name: string;
  description: string;
  start_scene_id?: string;
}

export interface StoryCast {
  story_id: string;
  cast_id: string;
  character_id: string;
}

export type InsertCharacter = Omit<Character, 'character_id'>;
export type InsertScene = Omit<Scene, 'scene_id'>;
export type InsertCast = Omit<Cast, 'cast_id'>;
export type InsertStory = Omit<Story, 'story_id' | 'start_scene_id'>;
