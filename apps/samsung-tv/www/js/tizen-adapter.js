/**
 * StreamX Samsung Tizen Platform Adapter
 * Handles Tizen TV Remote registration, hardware key mapping, and WebAPI lifecycle.
 */
(function (window) {
  'use strict';

  class TizenAdapter {
    constructor() {
      this.isTizen = typeof window.tizen !== 'undefined';
      this.registeredKeys = [];
      this.onBackCallback = null;
      this.onMediaKeyCallback = null;
      this.onChannelChangeCallback = null;
      this.onNumberKeyCallback = null;
      this.onColorKeyCallback = null;
    }

    init() {
      console.log('[StreamX Tizen] Initializing Tizen Platform Adapter. Environment:', this.isTizen ? 'Tizen OS' : 'Browser/Simulator');

      if (this.isTizen && window.tizen.tvinputdevice) {
        this.registerTizenKeys();
      }

      this.setupGlobalKeyListener();
      this.setupVisibilityListener();
    }

    registerTizenKeys() {
      const keysToRegister = [
        'MediaPlay',
        'MediaPause',
        'MediaPlayPause',
        'MediaStop',
        'MediaFastForward',
        'MediaRewind',
        'ChannelUp',
        'ChannelDown',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'ColorF0Red',
        'ColorF1Green',
        'ColorF2Yellow',
        'ColorF3Blue',
        'Info'
      ];

      for (const keyName of keysToRegister) {
        try {
          window.tizen.tvinputdevice.registerKey(keyName);
          this.registeredKeys.push(keyName);
        } catch (e) {
          console.warn(`[StreamX Tizen] Could not register key: ${keyName}`, e.message);
        }
      }
      console.log(`[StreamX Tizen] Registered ${this.registeredKeys.length} remote control keys.`);
    }

    setupGlobalKeyListener() {
      window.addEventListener('keydown', (e) => {
        const keyCode = e.keyCode;

        // 1. Tizen Back / Return Key (10009) or browser Back/Escape
        if (keyCode === 10009 || keyCode === 27) {
          e.preventDefault();
          if (this.onBackCallback) {
            this.onBackCallback();
          }
          return;
        }

        // 2. Media Playback Keys
        if (keyCode === 415 || keyCode === 19 || keyCode === 10252 || keyCode === 413 || keyCode === 417 || keyCode === 412) {
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

        // 3. Channel Up (427) / Down (428) or Page Up (33) / Page Down (34)
        if (keyCode === 427 || keyCode === 428 || keyCode === 33 || keyCode === 34) {
          e.preventDefault();
          const direction = (keyCode === 427 || keyCode === 33) ? 'next' : 'prev';
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

        // 6. Info Key (457)
        if (keyCode === 457) {
          e.preventDefault();
          if (this.onColorKeyCallback) {
            this.onColorKeyCallback('info');
          }
          return;
        }
      }, false);
    }

    setupVisibilityListener() {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('[StreamX Tizen] Application sent to background.');
          this.setScreenSaver(true);
        } else {
          console.log('[StreamX Tizen] Application restored to foreground.');
          this.setScreenSaver(false);
        }
      });
    }

    setScreenSaver(enable) {
      if (typeof window.webapis !== 'undefined' && window.webapis.appcommon) {
        try {
          const state = enable
            ? window.webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON
            : window.webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF;
          window.webapis.appcommon.setScreenSaver(state);
          console.log(`[StreamX Tizen] ScreenSaver set to: ${enable ? 'ON' : 'OFF'}`);
        } catch (e) {
          console.warn('[StreamX Tizen] Error setting screen saver state:', e.message);
        }
      }
    }

    exitApplication() {
      console.log('[StreamX Tizen] Exiting Tizen application.');
      if (this.isTizen && window.tizen.application) {
        window.tizen.application.getCurrentApplication().exit();
      } else {
        window.close();
      }
    }
  }

  window.TizenAdapter = new TizenAdapter();
})(window);
