/**
 * StreamX LG webOS Platform Adapter
 * Handles LG webOS Magic Remote, hardware key mapping, and webOS lifecycle events.
 */
(function (window) {
  'use strict';

  class WebOSAdapter {
    constructor() {
      this.isWebOS = typeof window.webOS !== 'undefined' || navigator.userAgent.includes('Web0S') || navigator.userAgent.includes('webOS');
      this.isPointerVisible = false;
      this.onBackCallback = null;
      this.onMediaKeyCallback = null;
      this.onChannelChangeCallback = null;
      this.onNumberKeyCallback = null;
      this.onColorKeyCallback = null;
    }

    init() {
      console.log('[StreamX webOS] Initializing LG webOS Adapter. Environment:', this.isWebOS ? 'LG webOS TV' : 'Browser/Simulator');

      this.setupGlobalKeyListener();
      this.setupPointerDetection();
      this.setupWebOSLifecycle();
    }

    setupGlobalKeyListener() {
      window.addEventListener('keydown', (e) => {
        const keyCode = e.keyCode;

        // When a D-Pad key is pressed, pointer is considered inactive
        if (keyCode >= 37 && keyCode <= 40) {
          this.isPointerVisible = false;
          document.body.classList.remove('magic-pointer-active');
        }

        // 1. webOS Back Key (461) or browser Escape
        if (keyCode === 461 || keyCode === 27) {
          e.preventDefault();
          if (this.onBackCallback) {
            this.onBackCallback();
          }
          return;
        }

        // 2. Media Playback Keys (Play: 415, Pause: 19, Stop: 413, FF: 417, REW: 412)
        if (keyCode === 415 || keyCode === 19 || keyCode === 413 || keyCode === 417 || keyCode === 412) {
          e.preventDefault();
          if (this.onMediaKeyCallback) {
            let action = 'toggle';
            if (keyCode === 415) action = 'play';
            else if (keyCode === 19) action = 'pause';
            else if (keyCode === 413) action = 'stop';
            else if (keyCode === 417) action = 'ff';
            else if (keyCode === 412) action = 'rew';
            this.onMediaKeyCallback(action);
          }
          return;
        }

        // 3. Channel Up (33 - PageUp) / Channel Down (34 - PageDown)
        if (keyCode === 33 || keyCode === 34) {
          e.preventDefault();
          const direction = (keyCode === 33) ? 'next' : 'prev';
          if (this.onChannelChangeCallback) {
            this.onChannelChangeCallback(direction);
          }
          return;
        }

        // 4. Number Keys 0-9 (48-57)
        if (keyCode >= 48 && keyCode <= 57) {
          const num = keyCode - 48;
          if (this.onNumberKeyCallback) {
            this.onNumberKeyCallback(num);
          }
          return;
        }

        // 5. Color Keys (Red: 403, Green: 404, Yellow: 405, Blue: 406)
        if (keyCode >= 403 && keyCode <= 406) {
          e.preventDefault();
          const colors = { 403: 'red', 404: 'green', 405: 'yellow', 406: 'blue' };
          if (this.onColorKeyCallback) {
            this.onColorKeyCallback(colors[keyCode]);
          }
          return;
        }
      }, false);
    }

    setupPointerDetection() {
      // LG Magic Remote moves pointer on screen
      window.addEventListener('mousemove', () => {
        if (!this.isPointerVisible) {
          this.isPointerVisible = true;
          document.body.classList.add('magic-pointer-active');
        }
      });
    }

    setupWebOSLifecycle() {
      // webOS Relaunch event
      document.addEventListener('webOSRelaunch', (e) => {
        console.log('[StreamX webOS] webOSRelaunch event received:', e.detail);
        if (window.webOS && window.webOS.relaunch) {
          window.webOS.relaunch();
        }
      });

      // Background / Foreground visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('[StreamX webOS] App sent to background.');
          if (this.onMediaKeyCallback) {
            this.onMediaKeyCallback('pause');
          }
        } else {
          console.log('[StreamX webOS] App restored to foreground.');
        }
      });
    }

    exitApplication() {
      console.log('[StreamX webOS] Exiting webOS application.');
      if (window.webOS && window.webOS.platformBack) {
        window.webOS.platformBack();
      } else {
        window.close();
      }
    }
  }

  window.WebOSAdapter = new WebOSAdapter();
})(window);
