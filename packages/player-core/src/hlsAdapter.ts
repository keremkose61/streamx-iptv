import Hls from 'hls.js';
import { PlayerAdapter, PlaybackState, PlayerEvents, PlayerOptions, QualityLevel } from './types.js';

export class HlsPlayerAdapter implements PlayerAdapter {
  private videoElement: HTMLVideoElement;
  private hls: Hls | null = null;
  private events: PlayerEvents;
  private options: PlayerOptions;
  private currentState: PlaybackState = 'IDLE';
  private retryCount = 0;
  private currentUrl = '';

  constructor(videoElement: HTMLVideoElement, events: PlayerEvents, options: PlayerOptions = {}) {
    this.videoElement = videoElement;
    this.events = events;
    this.options = {
      bufferLengthSeconds: 30,
      autoPlay: true,
      maxRetries: 3,
      ...options,
    };

    this.bindVideoEvents();
  }

  private setState(state: PlaybackState) {
    this.currentState = state;
    this.events.onStateChange(state);
  }

  private bindVideoEvents() {
    this.videoElement.addEventListener('playing', () => this.setState('PLAYING'));
    this.videoElement.addEventListener('pause', () => {
      if (this.currentState !== 'ERROR') this.setState('PAUSED');
    });
    this.videoElement.addEventListener('waiting', () => this.setState('BUFFERING'));
    this.videoElement.addEventListener('timeupdate', () => {
      this.events.onTimeUpdate(this.videoElement.currentTime, this.videoElement.duration);
    });
  }

  public async load(url: string): Promise<void> {
    this.currentUrl = url;
    this.retryCount = 0;
    this.setState('LOADING');

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    if (Hls.isSupported()) {
      this.hls = new Hls({
        maxBufferLength: this.options.bufferLengthSeconds || 30,
        maxMaxBufferLength: (this.options.bufferLengthSeconds || 30) * 2,
        liveSyncDurationCount: 3,
        enableWorker: true,
        lowLatencyMode: true,
      });

      this.hls.attachMedia(this.videoElement);

      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this.hls?.loadSource(url);
      });

      this.hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels: QualityLevel[] = data.levels.map((lvl, index) => ({
          id: index,
          height: lvl.height,
          bitrate: lvl.bitrate,
          label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}k`,
        }));
        this.events.onQualityLevels(levels);

        if (this.options.autoPlay) {
          this.play().catch(() => this.setState('PAUSED'));
        }
      });

      this.hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          this.handleFatalError(data);
        }
      });
    } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple HLS (Safari / iOS / TV)
      this.videoElement.src = url;
      if (this.options.autoPlay) {
        this.play().catch(() => this.setState('PAUSED'));
      }
    } else {
      this.setState('ERROR');
      this.events.onError({
        code: 'UNSUPPORTED_FORMAT',
        message: 'Tarayıcınız HLS akış formatını desteklemiyor.',
        fatal: true,
      });
    }
  }

  private handleFatalError(data: any) {
    if (this.retryCount < (this.options.maxRetries || 3)) {
      this.retryCount++;
      this.setState('BUFFERING');
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        this.hls?.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        this.hls?.recoverMediaError();
      } else {
        this.load(this.currentUrl);
      }
    } else {
      this.setState('ERROR');
      this.events.onError({
        code: data.details,
        message: 'Yayın akışı kesildi veya kaynak sunucuya ulaşılamıyor.',
        fatal: true,
      });
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

  public setQuality(levelId: number): void {
    if (this.hls) {
      this.hls.currentLevel = levelId; // -1 for auto
    }
  }

  public getQualityLevels(): QualityLevel[] {
    if (!this.hls) return [];
    return this.hls.levels.map((lvl, index) => ({
      id: index,
      height: lvl.height,
      bitrate: lvl.bitrate,
      label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}k`,
    }));
  }

  public getCurrentState(): PlaybackState {
    return this.currentState;
  }

  public destroy(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    this.videoElement.removeAttribute('src');
    this.videoElement.load();
    this.currentState = 'IDLE';
  }
}
