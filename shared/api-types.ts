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

export type InsertCharacter = Omit<Character, 'character_id'>;
export type InsertScene = Omit<Scene, 'scene_id'>;
export type InsertCast = Omit<Cast, 'cast_id'>;
