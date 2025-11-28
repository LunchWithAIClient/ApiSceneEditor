export interface Character {
  character_id: string;
  name: string;
  description: string;
  motivation: string;
  deleted?: boolean;
}

export interface Scene {
  scene_id: string;
  name: string;
  description: string;
  deleted?: boolean;
}

export interface Cast {
  cast_id: string;
  scene_id: string;
  role: string;
  goal: string;
  start: string;
  deleted?: boolean;
}

export type InsertCharacter = Omit<Character, 'character_id'>;
export type InsertScene = Omit<Scene, 'scene_id'>;
export type InsertCast = Omit<Cast, 'cast_id'>;

export interface UserIdentity {
  sub: string;
  email: string | null;
  name: string | null;
}

export interface UserAccount {
  user_id: string;
  contactName?: string;
}

export interface UserProfile {
  identity: UserIdentity;
  accounts: UserAccount[];
}

export interface UserAccountIdentity extends UserIdentity {
  user_id: string;
}

export interface UserPreferences {
  user_id: string;
  sqs_url: string;
  model_name: string;
  model_created_on: string;
  prompt_id: string;
  prompt_created_on: string;
  contactName?: string;
}

export interface UserAccountProfile {
  identity: UserAccountIdentity;
  preferences: UserPreferences;
}
