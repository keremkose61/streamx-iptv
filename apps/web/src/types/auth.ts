export interface Subscription {
  id: number;
  user_id: number;
  tier: 'free' | 'premium' | 'pro';
  max_playlists: number;
  max_devices: number;
  expires_at: string | null;
}

export interface UserSettings {
  id: number;
  user_id: number;
  theme: string;
  language: string;
  preferred_player: string;
  buffer_length_seconds: number;
  parental_control_enabled: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  subscription?: Subscription;
  settings?: UserSettings;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
