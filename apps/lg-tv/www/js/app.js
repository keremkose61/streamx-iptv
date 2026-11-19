/**
 * StreamX Smart TV Main Application Controller
 * Handles 10-foot UI, Channel Grids, OSD, Favorites, EPG sync, and Remote Control actions.
 */
(function (window) {
  'use strict';

  // Built-in verified IPTV demo streams for instant out-of-the-box TV experience
  const DEFAULT_CHANNELS = [
    {
      id: 1,
      channel_number: 1,
      name: 'TRT 1 HD',
      group_title: 'GENEL',
      stream_url: 'https://tv-trt1.medya.trt.com.tr/master.m3u8',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/TRT_1_logo.svg/300px-TRT_1_logo.svg.png',
      resolution: '1080p50',
      current_program: 'Gönül Dağı - Canlı',
      next_program: 'Ana Haber Bülteni (19:00)'
    },
    {
      id: 2,
      channel_number: 2,
      name: 'TRT Haber HD',
      group_title: 'HABER',
      stream_url: 'https://tv-trthaber.medya.trt.com.tr/master.m3u8',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/TRT_Haber_logo.svg/300px-TRT_Haber_logo.svg.png',
      resolution: '1080p50',
      current_program: 'Dünya Gündemi ve Analiz',
      next_program: 'Ekonomi Notları (18:00)'
    },
    {
      id: 3,
      channel_number: 3,
      name: 'TRT Spor HD',
      group_title: 'SPOR',
      stream_url: 'https://tv-trtspor.medya.trt.com.tr/master.m3u8',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/TRT_Spor_logo.svg/300px-TRT_Spor_logo.svg.png',
      resolution: '1080p50',
      current_program: 'Spor Manşet - Canlı',
      next_program: 'Süper Lig Özetleri (19:30)'
    },
    {
      id: 4,
      channel_number: 4,
      name: 'TRT World HD',
      group_title: 'HABER',
      stream_url: 'https://tv-trtworld.medya.trt.com.tr/master.m3u8',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/TRT_World_logo.svg/300px-TRT_World_logo.svg.png',
      resolution: '1080p',
      current_program: 'News Hour Live Analysis',
      next_program: 'The Newsmakers (20:00)'
    },
    {
      id: 5,
      channel_number: 5,
      name: 'Red Bull TV 4K',
      group_title: 'SPOR',
      stream_url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
      logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Red_Bull_TV_logo.svg/300px-Red_Bull_TV_logo.svg.png',
      resolution: '4K UHD',
      current_program: 'Extreme Sports World Championship',
      next_program: 'Mountain Bike Trails World Tour'
    },
    {
      id: 6,
      channel_number: 6,
      name: 'Nature Relaxation HD',
      group_title: 'BELGESEL',
      stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      logo_url: '',
      resolution: '1080p',
      current_program: 'Wild Wildlife: Majestic Oceans',
      next_program: 'Rainforest Mysteries (21:00)'
    },
    {
      id: 7,
      channel_number: 7,
      name: 'Big Buck Bunny 1080p',
      group_title: 'SINEMA',
      stream_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      logo_url: '',
      resolution: '1080p',
      current_program: 'Animation Classics Showcase',
      next_program: 'Short Films Festival (20:30)'
    },
    {
      id: 8,
      channel_number: 8,
      name: 'Tears of Steel Sci-Fi',
      group_title: 'SINEMA',
      stream_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      logo_url: '',
      resolution: '4K UHD',
      current_program: 'Science Fiction Feature Film',
      next_program: 'Visual Effects Retrospective'
    }
  ];

  class TvApplication {
    constructor() {
      this.channels = [...DEFAULT_CHANNELS];
      this.currentChannel = null;
      this.activeGroup = 'ALL';
      this.favorites = new Set([1, 3]); // TRT 1 and TRT Spor favorited by default
      this.activeTab = 'live'; // 'live', 'favorites', 'epg', 'settings'
      this.isOverlayVisible = true;
      this.osdTimeout = null;
      this.directJumpBuffer = '';
      this.directJumpTimeout = null;
      this.apiUrl = localStorage.getItem('streamx_api_url') || 'http://localhost:8000/api/v1';
      this.apiToken = localStorage.getItem('streamx_token') || '';
    }

    init() {
      console.log('[StreamX App] Initializing Smart TV Application...');

      // 1. Initialize Player
      window.TvPlayer.init('tv-video');
      window.TvPlayer.onStateChangeCallback = (state) => this.handlePlayerStateChange(state);
      window.TvPlayer.onErrorCallback = (msg) => this.handlePlayerError(msg);

      // 2. Initialize Platform Adapter (Tizen or webOS)
      const adapter = window.WebOSAdapter || window.TizenAdapter;
      if (adapter) {
        adapter.init();
        adapter.onBackCallback = () => this.handleBackKey();
        adapter.onMediaKeyCallback = (act) => this.handleMediaKey(act);
        adapter.onChannelChangeCallback = (dir) => this.handleChannelStep(dir);
        adapter.onNumberKeyCallback = (num) => this.handleDirectJump(num);
        adapter.onColorKeyCallback = (color) => this.handleColorKey(color);
      }

      // 3. Render UI Components
      this.renderClock();
      setInterval(() => this.renderClock(), 1000);
      this.renderCategories();
      this.renderChannels();
      this.setupSidebarEvents();

      // 4. Initialize Spatial Navigation
      window.SpatialNavigation.init('.channel-card');

      // 5. Auto-play first channel
      if (this.channels.length > 0) {
        this.selectChannel(this.channels[0]);
      }

      // 6. Attempt background sync with StreamX Backend API if token exists
      this.syncWithBackend();
    }

    renderClock() {
      const el = document.getElementById('clock-display');
      if (el) {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        el.textContent = `${hrs}:${mins}`;
      }
    }

    renderCategories() {
      const container = document.getElementById('category-filter-bar');
      if (!container) return;

      const groups = ['ALL'];
      for (const ch of this.channels) {
        if (ch.group_title && !groups.includes(ch.group_title)) {
          groups.push(ch.group_title);
        }
      }

      container.innerHTML = '';
      for (const group of groups) {
        const pill = document.createElement('div');
        pill.className = `category-pill ${group === this.activeGroup ? 'active' : ''}`;
        pill.textContent = group === 'ALL' ? 'Tüm Kanallar' : group;
        pill.setAttribute('data-group', group);
        pill.setAttribute('data-nav-group', 'categories');
        pill.tabIndex = 0;

        pill.addEventListener('click', () => {
          this.activeGroup = group;
          this.renderCategories();
          this.renderChannels();
          const firstCard = document.querySelector('.channel-card');
          if (firstCard) window.SpatialNavigation.focus(firstCard);
        });

        container.appendChild(pill);
      }
    }

    renderChannels() {
      const container = document.getElementById('channel-grid');
      if (!container) return;

      container.innerHTML = '';

      let filtered = this.channels;
      if (this.activeTab === 'favorites') {
        filtered = filtered.filter((c) => this.favorites.has(c.id));
      } else if (this.activeGroup !== 'ALL') {
        filtered = filtered.filter((c) => c.group_title === this.activeGroup);
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 48px; text-align: center; color: #94a3b8; font-size: 20px;">
            Bu kategoride gösterilecek kanal bulunamadı.
          </div>
        `;
        return;
      }

      filtered.forEach((ch, idx) => {
        const card = document.createElement('div');
        const isCurrent = this.currentChannel && this.currentChannel.id === ch.id;
        const isFav = this.favorites.has(ch.id);

        card.className = `channel-card ${isCurrent ? 'current-playing' : ''} ${isFav ? 'is-favorite' : ''}`;
        card.setAttribute('data-channel-id', ch.id);
        card.setAttribute('data-nav-group', 'channels');
        card.tabIndex = 0;

        card.innerHTML = `
          <div class="channel-num">${String(ch.channel_number || idx + 1).padStart(2, '0')}</div>
          <div class="channel-logo-container">
            ${ch.logo_url ? `<img class="channel-logo" src="${ch.logo_url}" alt="${ch.name}" onerror="this.style.display='none'"/>` : `<span>📺</span>`}
          </div>
          <div class="channel-details">
            <div class="channel-name">${ch.name}</div>
            <div class="channel-epg-hint">${ch.current_program || ch.group_title}</div>
          </div>
          <div class="card-badges">
            <span class="badge-res">${ch.resolution || 'HD'}</span>
            <span class="fav-star">★</span>
          </div>
        `;

        card.addEventListener('click', () => {
          this.selectChannel(ch);
          // When channel is clicked, close UI overlay so user watches in fullscreen
          this.hideOverlay();
        });

        container.appendChild(card);
      });
    }

    setupSidebarEvents() {
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach((item) => {
        item.addEventListener('click', () => {
          const tab = item.getAttribute('data-tab');
          if (tab === 'exit') {
            this.showExitConfirm();
            return;
          }

          navItems.forEach((n) => n.classList.remove('active'));
          item.classList.add('active');
          this.activeTab = tab;

          if (tab === 'live') {
            this.activeGroup = 'ALL';
            this.renderCategories();
            this.renderChannels();
          } else if (tab === 'favorites') {
            this.renderChannels();
          } else if (tab === 'epg') {
            this.showEpgGuide();
          } else if (tab === 'settings') {
            this.showSettings();
          }
        });
      });
    }

    selectChannel(ch) {
      this.currentChannel = ch;
      console.log(`[StreamX App] Playing channel: ${ch.name}`);

      // Highlight playing card in grid
      document.querySelectorAll('.channel-card').forEach((c) => {
        if (c.getAttribute('data-channel-id') === String(ch.id)) {
          c.classList.add('current-playing');
        } else {
          c.classList.remove('current-playing');
        }
      });

      // Load into TV player
      window.TvPlayer.load(ch.stream_url, ch);

      // Show OSD banner
      this.showOsd(ch);

      // Record watch history silently on backend
      this.recordWatchHistory(ch.id);
    }

    showOsd(ch) {
      const osd = document.getElementById('tv-osd');
      if (!osd) return;

      document.getElementById('osd-num').textContent = String(ch.channel_number || ch.id).padStart(3, '0');
      document.getElementById('osd-title').textContent = ch.name;
      document.getElementById('osd-category').textContent = ch.group_title;
      document.getElementById('osd-res-badge').textContent = ch.resolution || '1080p Full HD';
      document.getElementById('osd-now').textContent = `Şimdi: ${ch.current_program || 'Canlı Yayın'}`;
      document.getElementById('osd-next').textContent = `Sonraki: ${ch.next_program || 'Yayın Akışı'}`;

      osd.classList.remove('osd-hidden');

      if (this.osdTimeout) {
        clearTimeout(this.osdTimeout);
      }

      this.osdTimeout = setTimeout(() => {
        osd.classList.add('osd-hidden');
      }, 5000);
    }

    hideOverlay() {
      const overlay = document.getElementById('ui-overlay');
      if (overlay) {
        overlay.classList.add('hidden-overlay');
        this.isOverlayVisible = false;
      }
    }

    showOverlay() {
      const overlay = document.getElementById('ui-overlay');
      if (overlay) {
        overlay.classList.remove('hidden-overlay');
        this.isOverlayVisible = true;
        // Focus currently playing channel card
        const currentCard = document.querySelector('.channel-card.current-playing') || document.querySelector('.channel-card');
        if (currentCard) {
          window.SpatialNavigation.focus(currentCard);
        }
      }
    }

    toggleOverlay() {
      if (this.isOverlayVisible) {
        this.hideOverlay();
      } else {
        this.showOverlay();
      }
    }

    handleBackKey() {
      // 1. If Exit Modal is visible, close modal
      const modal = document.getElementById('exit-modal');
      if (modal && !modal.classList.contains('hidden-modal')) {
        this.closeExitConfirm();
        return;
      }

      // 2. If OSD is visible, hide OSD
      const osd = document.getElementById('tv-osd');
      if (osd && !osd.classList.contains('osd-hidden')) {
        osd.classList.add('osd-hidden');
        return;
      }

      // 3. If UI overlay is open, hide overlay to enjoy fullscreen video
      if (this.isOverlayVisible) {
        this.hideOverlay();
        return;
      }

      // 4. If already in fullscreen video, prompt application exit
      this.showExitConfirm();
    }

    handleMediaKey(action) {
      switch (action) {
        case 'play':
          window.TvPlayer.play();
          break;
        case 'pause':
          window.TvPlayer.pause();
          break;
        case 'toggle':
          window.TvPlayer.togglePlayPause();
          break;
        case 'stop':
          window.TvPlayer.pause();
          break;
        case 'ff':
        case 'rew':
          break;
      }
    }

    handleChannelStep(direction) {
      if (this.channels.length === 0) return;
      const curIndex = this.channels.findIndex((c) => this.currentChannel && c.id === this.currentChannel.id);
      let nextIndex = 0;
      if (direction === 'next') {
        nextIndex = (curIndex + 1) % this.channels.length;
      } else {
        nextIndex = (curIndex - 1 + this.channels.length) % this.channels.length;
      }

      this.selectChannel(this.channels[nextIndex]);
    }

    handleDirectJump(digit) {
      this.directJumpBuffer += String(digit);
      const box = document.getElementById('direct-jump-box');
      if (box) {
        box.textContent = `CH ${this.directJumpBuffer}`;
        box.classList.add('visible');
      }

      if (this.directJumpTimeout) {
        clearTimeout(this.directJumpTimeout);
      }

      this.directJumpTimeout = setTimeout(() => {
        const targetNum = parseInt(this.directJumpBuffer, 10);
        this.directJumpBuffer = '';
        if (box) box.classList.remove('visible');

        const found = this.channels.find((c) => c.channel_number === targetNum || c.id === targetNum);
        if (found) {
          this.selectChannel(found);
        } else {
          console.warn(`[StreamX App] Channel number ${targetNum} not found.`);
        }
      }, 1500);
    }

    handleColorKey(color) {
      console.log(`[StreamX App] Color key pressed: ${color}`);
      switch (color) {
        case 'red': // Toggle OSD
        case 'info':
          if (this.currentChannel) {
            this.showOsd(this.currentChannel);
          }
          break;
        case 'green': // Focus Category filter
          this.showOverlay();
          const firstPill = document.querySelector('.category-pill.active') || document.querySelector('.category-pill');
          if (firstPill) window.SpatialNavigation.focus(firstPill);
          break;
        case 'yellow': // Toggle Favorite for current channel
          if (this.currentChannel) {
            this.toggleFavorite(this.currentChannel.id);
          }
          break;
        case 'blue': // Reload stream
          if (this.currentChannel) {
            this.selectChannel(this.currentChannel);
          }
          break;
      }
    }

    toggleFavorite(channelId) {
      if (this.favorites.has(channelId)) {
        this.favorites.delete(channelId);
      } else {
        this.favorites.add(channelId);
      }

      this.renderChannels();
      if (this.currentChannel) {
        this.showOsd(this.currentChannel);
      }

      // Sync favorite to backend API
      if (this.apiToken) {
        fetch(`${this.apiUrl}/favorites/${channelId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            Accept: 'application/json'
          }
        }).catch(() => {});
      }
    }

    handlePlayerStateChange(state) {
      const spinner = document.getElementById('buffer-spinner');
      if (spinner) {
        if (state === 'BUFFERING') {
          spinner.classList.add('visible');
        } else {
          spinner.classList.remove('visible');
        }
      }
    }

    handlePlayerError(msg) {
      console.error('[StreamX App] Playback error caught:', msg);
    }

    showExitConfirm() {
      const modal = document.getElementById('exit-modal');
      if (modal) {
        modal.classList.remove('hidden-modal');
        modal.style.display = 'flex';
        window.SpatialNavigation.setScope('#exit-modal');
      }
    }

    closeExitConfirm() {
      const modal = document.getElementById('exit-modal');
      if (modal) {
        modal.classList.add('hidden-modal');
        modal.style.display = 'none';
        window.SpatialNavigation.clearScope();
        const firstCard = document.querySelector('.channel-card');
        if (firstCard) window.SpatialNavigation.focus(firstCard);
      }
    }

    confirmExit() {
      const adapter = window.WebOSAdapter || window.TizenAdapter;
      if (adapter) {
        adapter.exitApplication();
      } else {
        window.close();
      }
    }

    recordWatchHistory(channelId) {
      if (!this.apiToken) return;
      fetch(`${this.apiUrl}/history/${channelId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          Accept: 'application/json'
        }
      }).catch(() => {});
    }

    async syncWithBackend() {
      if (!this.apiToken) return;
      try {
        const res = await fetch(`${this.apiUrl}/channels?per_page=100`, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            Accept: 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && data.data.length > 0) {
            this.channels = data.data.map((c, idx) => ({
              id: c.id,
              channel_number: idx + 1,
              name: c.name,
              group_title: c.group_title || 'GENEL',
              stream_url: c.stream_url,
              logo_url: c.logo_url,
              resolution: 'FHD',
              current_program: 'Yayın Akışı',
              next_program: 'Sonraki Program'
            }));
            this.renderCategories();
            this.renderChannels();
            console.log(`[StreamX App] Synced ${this.channels.length} channels from backend API.`);
          }
        }
      } catch (e) {
        console.warn('[StreamX App] Backend sync failed, keeping offline channels:', e.message);
      }
    }

    showEpgGuide() {
      const panel = document.getElementById('channel-grid');
      if (!panel) return;

      panel.innerHTML = `
        <div style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 16px;">
          <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">EPG Elektronik Program Rehberi</h2>
          ${this.channels.map((ch) => `
            <div style="background: rgba(17, 23, 35, 0.9); border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-size: 20px; font-weight: 800; color: #818cf8;">${String(ch.channel_number).padStart(2, '0')}</span>
                <span style="font-size: 18px; font-weight: 700;">${ch.name}</span>
              </div>
              <div style="display: flex; gap: 24px; font-size: 16px;">
                <span style="color: #10b981; font-weight: 600;">● ${ch.current_program}</span>
                <span style="color: #94a3b8;">Sonraki: ${ch.next_program}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    showSettings() {
      const panel = document.getElementById('channel-grid');
      if (!panel) return;

      panel.innerHTML = `
        <div style="grid-column: 1 / -1; max-width: 800px; display: flex; flex-direction: column; gap: 24px; padding: 20px;">
          <h2 style="font-size: 26px; font-weight: 800;">Akıllı TV Ayarları</h2>
          <div style="background: rgba(17, 23, 35, 0.9); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
            <div style="font-size: 18px; font-weight: 700;">StreamX API Sunucusu</div>
            <div style="font-size: 15px; color: #94a3b8;">Bağlantı adresi: <code>${this.apiUrl}</code></div>
          </div>
          <div style="background: rgba(17, 23, 35, 0.9); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
            <div style="font-size: 18px; font-weight: 700;">Cihaz ve Platform Bilgisi</div>
            <div style="font-size: 15px; color: #94a3b8;">Platform: LG webOS TV</div>
            <div style="font-size: 15px; color: #94a3b8;">Çözünürlük: 1920x1080 Full HD (Hardware Scaled)</div>
            <div style="font-size: 15px; color: #94a3b8;">HLS Arabellek Boyutu: 30 Saniye</div>
          </div>
        </div>
      `;
    }
  }

  window.TvApplication = new TvApplication();

  window.addEventListener('DOMContentLoaded', () => {
    window.TvApplication.init();
  });
})(window);
