/**
 * StreamX TV Player Engine
 * Robust video player manager for Smart TV devices supporting HLS.js and native HTML5 video.
 */
(function (window) {
  'use strict';

  class TvPlayer {
    constructor() {
      this.videoElement = null;
      this.hls = null;
      this.playbackState = 'IDLE'; // IDLE, BUFFERING, PLAYING, PAUSED, ERROR
      this.currentStreamUrl = null;
      this.currentChannel = null;
      this.retryCount = 0;
      this.maxRetries = 3;
      this.onStateChangeCallback = null;
      this.onErrorCallback = null;
    }

    init(videoElementId) {
      this.videoElement = document.getElementById(videoElementId);
      if (!this.videoElement) {
        console.error('[StreamX TvPlayer] Video element not found:', videoElementId);
        return;
      }

      this.setupVideoEvents();
      console.log('[StreamX TvPlayer] Video player initialized.');
    }

    setupVideoEvents() {
      const v = this.videoElement;

      v.addEventListener('waiting', () => {
        this.setState('BUFFERING');
      });

      v.addEventListener('playing', () => {
        this.setState('PLAYING');
        this.retryCount = 0;
      });

      v.addEventListener('pause', () => {
        if (this.playbackState !== 'ERROR') {
          this.setState('PAUSED');
        }
      });

      v.addEventListener('error', (e) => {
        console.warn('[StreamX TvPlayer] Native video error:', e);
        this.handlePlaybackError('Video akışı yüklenirken bir hata oluştu.');
      });
    }

    setState(newState) {
      if (this.playbackState === newState) return;
      this.playbackState = newState;
      console.log(`[StreamX TvPlayer] State changed: ${newState}`);
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(newState);
      }
    }

    load(streamUrl, channelInfo) {
      this.currentStreamUrl = streamUrl;
      this.currentChannel = channelInfo;
      this.setState('BUFFERING');

      if (this.hls) {
        this.hls.destroy();
        this.hls = null;
      }

      const isHlsSupported = typeof window.Hls !== 'undefined' && window.Hls.isSupported();
      const canPlayNative = this.videoElement.canPlayType('application/vnd.apple.mpegurl');

      console.log(`[StreamX TvPlayer] Loading stream: ${streamUrl}`);
      console.log(`[StreamX TvPlayer] HLS.js: ${isHlsSupported}, Native HLS: ${!!canPlayNative}`);

      if (isHlsSupported) {
        const hlsConfig = {
          maxBufferLength: 25,
          maxMaxBufferLength: 50,
          enableWorker: true,
          lowLatencyMode: false,
          manifestLoadingTimeOut: 12000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 12000
        };

        const hls = new window.Hls(hlsConfig);
        this.hls = hls;

        hls.loadSource(streamUrl);
        hls.attachMedia(this.videoElement);

        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          console.log('[StreamX TvPlayer] HLS manifest parsed, attempting play.');
          this.play();
        });

        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('[StreamX TvPlayer] Fatal network error encountered, attempting recovery...');
                hls.startLoad();
                break;
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('[StreamX TvPlayer] Fatal media error encountered, recovering media...');
                hls.recoverMediaError();
                break;
              default:
                console.error('[StreamX TvPlayer] Fatal unrecoverable HLS error:', data);
                this.handlePlaybackError('Yayın bağlantısı kurulamadı.');
                break;
            }
          }
        });
      } else {
        // Native HTML5 video fallback
        this.videoElement.src = streamUrl;
        this.play();
      }
    }

    play() {
      if (!this.videoElement) return;
      const promise = this.videoElement.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          console.warn('[StreamX TvPlayer] Play promise rejected:', err);
        });
      }
    }

    pause() {
      if (!this.videoElement) return;
      this.videoElement.pause();
    }

    togglePlayPause() {
      if (this.playbackState === 'PLAYING') {
        this.pause();
      } else {
        this.play();
      }
    }

    handlePlaybackError(msg) {
      if (this.retryCount < this.maxRetries && this.currentStreamUrl) {
        this.retryCount++;
        console.log(`[StreamX TvPlayer] Retrying stream (${this.retryCount}/${this.maxRetries})...`);
        setTimeout(() => {
          this.load(this.currentStreamUrl, this.currentChannel);
        }, 2000);
      } else {
        this.setState('ERROR');
        if (this.onErrorCallback) {
          this.onErrorCallback(msg);
        }
      }
    }

    destroy() {
      if (this.hls) {
        this.hls.destroy();
        this.hls = null;
      }
      if (this.videoElement) {
        this.videoElement.pause();
        this.videoElement.removeAttribute('src');
        this.videoElement.load();
      }
      this.playbackState = 'IDLE';
    }
  }

  window.TvPlayer = new TvPlayer();
})(window);
