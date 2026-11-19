import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { HlsPlayerAdapter, PlaybackState, QualityLevel } from '@streamx/player-core';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Tv,
  Search,
  RefreshCw,
  SkipBack,
  SkipForward,
  AlertCircle,
  Radio,
  Sliders,
  ChevronRight,
  List
} from 'lucide-react';

interface Channel {
  id: number;
  playlist_id: number;
  name: string;
  group_title: string;
  stream_url: string;
  logo_url: string | null;
}

export const LiveTV: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelSearch, setChannelSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Player State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<HlsPlayerAdapter | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [playbackState, setPlaybackState] = useState<PlaybackState>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Fetch Channels
  const { data: channelsData, isLoading } = useQuery<{ data: Channel[] }>({
    queryKey: ['live_channels', selectedGroup, channelSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedGroup) params.append('group', selectedGroup);
      if (channelSearch) params.append('search', channelSearch);
      params.append('per_page', '100');
      const res = await apiClient.get(`/channels?${params.toString()}`);
      return res.data;
    },
  });

  // Fetch Groups
  const { data: groupsData } = useQuery<{ groups: { group_title: string; total: number }[] }>({
    queryKey: ['live_channel_groups'],
    queryFn: async () => {
      const res = await apiClient.get('/channels/groups');
      return res.data;
    },
  });

  const channels = channelsData?.data || [];

  // Auto-select first channel on load if none selected
  useEffect(() => {
    if (!selectedChannel && channels.length > 0) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);

  // Initialize and load stream
  const loadStream = useCallback((channel: Channel) => {
    if (!videoRef.current) return;
    setErrorMessage(null);

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    const adapter = new HlsPlayerAdapter(
      videoRef.current,
      {
        onStateChange: (state: PlaybackState) => setPlaybackState(state),
        onError: (err: any) => {
          setErrorMessage(err.message || 'Yayın başlatılamadı veya adres erişilemez.');
        },
        onQualityLevels: (lvls: QualityLevel[]) => setQualities(lvls),
        onTimeUpdate: () => {},
      },
      {
        bufferLengthSeconds: 30,
        autoPlay: true,
      }
    );

    playerRef.current = adapter;
    adapter.load(channel.stream_url).catch((err: any) => {
      setErrorMessage(err.message || 'Akış yüklenemedi.');
    });
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadStream(selectedChannel);
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [selectedChannel, loadStream]);

  // Channel navigation
  const handleNextChannel = () => {
    if (!selectedChannel || channels.length === 0) return;
    const currentIndex = channels.findIndex((c) => c.id === selectedChannel.id);
    const nextIndex = (currentIndex + 1) % channels.length;
    setSelectedChannel(channels[nextIndex]);
  };

  const handlePrevChannel = () => {
    if (!selectedChannel || channels.length === 0) return;
    const currentIndex = channels.findIndex((c) => c.id === selectedChannel.id);
    const prevIndex = (currentIndex - 1 + channels.length) % channels.length;
    setSelectedChannel(channels[prevIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handlePrevChannel();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleNextChannel();
          break;
        case ' ':
          e.preventDefault();
          if (playbackState === 'PLAYING') {
            playerRef.current?.pause();
          } else {
            playerRef.current?.play();
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const handleQualityChange = (levelId: number) => {
    setCurrentQuality(levelId);
    playerRef.current?.setQuality(levelId);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playbackState === 'PLAYING') setShowControls(false);
    }, 3500);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-4 overflow-hidden">
      {/* Video Viewport Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative flex-1 bg-black rounded-3xl overflow-hidden border border-slate-800 flex items-center justify-center select-none shadow-2xl group"
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          onClick={() => {
            if (playbackState === 'PLAYING') playerRef.current?.pause();
            else playerRef.current?.play();
          }}
        />

        {/* Top Overlay Info */}
        <div
          className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition border border-slate-700/50"
              title="Kanal Listesini Aç/Kapat"
            >
              <List className="w-5 h-5" />
            </button>
            {selectedChannel && (
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs uppercase font-bold tracking-wider text-red-400">CANLI YAYIN</span>
                  <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                    {selectedChannel.group_title}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">{selectedChannel.name}</h2>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              Klavye: Ok Tuşları, Boşluk, F, M
            </span>
          </div>
        </div>

        {/* Center Indicators: Buffering / Error */}
        {playbackState === 'BUFFERING' && (
          <div className="absolute z-20 flex flex-col items-center gap-3 bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-800">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-sm font-semibold text-slate-200">Tamponlanıyor...</span>
          </div>
        )}

        {playbackState === 'LOADING' && (
          <div className="absolute z-20 flex flex-col items-center gap-3 bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-800">
            <Radio className="w-8 h-8 text-indigo-400 animate-pulse" />
            <span className="text-sm font-semibold text-slate-200">Yayına Bağlanılıyor...</span>
          </div>
        )}

        {errorMessage && (
          <div className="absolute z-30 max-w-md p-6 rounded-2xl bg-slate-950/95 border border-red-500/30 text-center space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Yayın Akışı Başlatılamadı</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => selectedChannel && loadStream(selectedChannel)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yeniden Bağlan</span>
            </button>
          </div>
        )}

        {/* Bottom Controls Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-4 transition-opacity duration-300 z-20 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Left: Play/Pause, Prev/Next */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (playbackState === 'PLAYING') playerRef.current?.pause();
                else playerRef.current?.play();
              }}
              className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
              title={playbackState === 'PLAYING' ? 'Durdur (Boşluk)' : 'Oynat (Boşluk)'}
            >
              {playbackState === 'PLAYING' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={handlePrevChannel}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/40 transition"
              title="Önceki Kanal (Yukarı Ok)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextChannel}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/40 transition"
              title="Sonraki Kanal (Aşağı Ok)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 pl-2">
              <button onClick={toggleMute} className="p-2 text-slate-300 hover:text-white" title="Sesi Aç/Kapat (M)">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-indigo-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Right: Quality, Fullscreen */}
          <div className="flex items-center gap-3">
            {qualities.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/50 rounded-xl px-2.5 py-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <select
                  value={currentQuality}
                  onChange={(e) => handleQualityChange(parseInt(e.target.value))}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="-1" className="bg-slate-900">Otomatik Kalite</option>
                  {qualities.map((q) => (
                    <option key={q.id} value={q.id} className="bg-slate-900">
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/40 transition"
              title="Tam Ekran (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Side Channel List Drawer */}
      {isSidebarOpen && (
        <div className="w-full lg:w-80 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shrink-0 shadow-2xl backdrop-blur-xl">
          <div className="space-y-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Kanal Listesi</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">{channels.length} Kanal</span>
            </div>

            {/* Filter & Search */}
            <div className="space-y-2">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Tüm Kategoriler</option>
                {(groupsData?.groups || []).map((g) => (
                  <option key={g.group_title} value={g.group_title}>
                    {g.group_title} ({g.total})
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Kanal ara..."
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Channels Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-500">Kanallar taranıyor...</div>
              ) : channels.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">Kanal bulunamadı.</div>
              ) : (
                channels.map((ch) => {
                  const isActive = selectedChannel?.id === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch)}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      {ch.logo_url ? (
                        <img
                          src={ch.logo_url}
                          alt=""
                          className="w-8 h-8 rounded-lg object-contain bg-slate-950 shrink-0"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-indigo-700' : 'bg-slate-800'}`}>
                          <Tv className="w-4 h-4" />
                        </div>
                      )}
                      <div className="overflow-hidden flex-1">
                        <div className="text-xs font-semibold truncate leading-tight">{ch.name}</div>
                        <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {ch.group_title}
                        </div>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
