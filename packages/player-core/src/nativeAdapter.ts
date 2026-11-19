import { PlayerAdapter, PlaybackState, PlayerEvents, PlayerOptions, QualityLevel } from './types.js';

export class NativePlayerAdapter implements PlayerAdapter {
  private videoElement: HTMLVideoElement;
  private events: PlayerEvents;
  private options: PlayerOptions;
  private currentState: PlaybackState = 'IDLE';

  constructor(videoElement: HTMLVideoElement, events: PlayerEvents, options: PlayerOptions = {}) {
    this.videoElement = videoElement;
    this.events = events;
    this.options = { autoPlay: true, ...options };

    this.bindEvents();
  }

  private setState(state: PlaybackState) {
    this.currentState = state;
    this.events.onStateChange(state);
  }

  private bindEvents() {
    this.videoElement.addEventListener('playing', () => this.setState('PLAYING'));
    this.videoElement.addEventListener('pause', () => {
      if (this.currentState !== 'ERROR') this.setState('PAUSED');
    });
    this.videoElement.addEventListener('waiting', () => this.setState('BUFFERING'));
    this.videoElement.addEventListener('timeupdate', () => {
      this.events.onTimeUpdate(this.videoElement.currentTime, this.videoElement.duration);
    });
    this.videoElement.addEventListener('error', () => {
      this.setState('ERROR');
      this.events.onError({
        code: 'MEDIA_ERR',
        message: 'Medya oynatılırken hata meydana geldi.',
        fatal: true,
      });
    });
  }

  public async load(url: string): Promise<void> {
    this.setState('LOADING');
    this.videoElement.src = url;
    this.events.onQualityLevels([]);

    if (this.options.autoPlay) {
      this.play().catch(() => this.setState('PAUSED'));
    }
  }

  public async play(): Promise<void> {
    return this.videoElement.play();
  }

  public pause(): void {
    this.videoElement.pause();
  }

  public seek(seconds: number): void {
    this.videoElement.currentTime = seconds;
  }

  public setVolume(volume: number): void {
    this.videoElement.volume = Math.max(0, Math.min(1, volume));
  }

  public setQuality(_levelId: number): void {
    // Native HTML5 does not expose HLS/DASH quality selection directly
  }

  public getQualityLevels(): QualityLevel[] {
    return [];
  }

  public getCurrentState(): PlaybackState {
    return this.currentState;
  }

  public destroy(): void {
    this.videoElement.removeAttribute('src');
    this.videoElement.load();
    this.currentState = 'IDLE';
  }
}
