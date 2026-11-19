import { PlayerAdapter, PlayerEvents, PlayerOptions } from './types.js';
import { HlsPlayerAdapter } from './hlsAdapter.js';
import { NativePlayerAdapter } from './nativeAdapter.js';

export class PlayerFactory {
  public static create(
    videoElement: HTMLVideoElement,
    url: string,
    events: PlayerEvents,
    options: PlayerOptions = {}
  ): PlayerAdapter {
    const isHls = url.includes('.m3u8') || url.includes('application/vnd.apple.mpegurl');

    if (isHls) {
      return new HlsPlayerAdapter(videoElement, events, options);
    }

    return new NativePlayerAdapter(videoElement, events, options);
  }
}
