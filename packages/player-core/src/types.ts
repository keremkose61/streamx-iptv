export type PlaybackState = 'IDLE' | 'LOADING' | 'PLAYING' | 'PAUSED' | 'BUFFERING' | 'ERROR';

export interface QualityLevel {
  id: number;
  height: number;
  bitrate: number;
  label: string;
}

export interface PlayerEvents {
  onStateChange: (state: PlaybackState) => void;
  onError: (error: { code: string; message: string; fatal: boolean }) => void;
  onQualityLevels: (levels: QualityLevel[]) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
}

export interface PlayerOptions {
  bufferLengthSeconds?: number;
  autoPlay?: boolean;
  maxRetries?: number;
}

export interface PlayerAdapter {
  load(url: string): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(seconds: number): void;
  setVolume(volume: number): void;
  setQuality(levelId: number): void;
  getQualityLevels(): QualityLevel[];
  getCurrentState(): PlaybackState;
  destroy(): void;
}
