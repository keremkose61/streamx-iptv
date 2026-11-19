import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Calendar, Clock, Tv, Search, ChevronRight, Info, X } from 'lucide-react';

interface Channel {
  id: number;
  name: string;
  group_title: string;
  logo_url: string | null;
  epg_channel_id: string | null;
}

interface EpgProgram {
  id: number;
  channel_id_ref: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
}

export const EPGGuide: React.FC = () => {
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<EpgProgram | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Channels
  const { data: channelsData, isLoading: isLoadingChannels } = useQuery<{ data: Channel[] }>({
    queryKey: ['epg_channels', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('per_page', '50');
      const res = await apiClient.get(`/channels?${params.toString()}`);
      return res.data;
    },
  });

  // Fetch Schedule for Selected Channel
  const { data: scheduleData, isLoading: isLoadingSchedule } = useQuery<{ channel: Channel; programs: EpgProgram[] }>({
    queryKey: ['channel_schedule', selectedChannelId],
    queryFn: async () => {
      if (!selectedChannelId) return { channel: {} as any, programs: [] };
      const res = await apiClient.get(`/epg/channel/${selectedChannelId}`);
      return res.data;
    },
    enabled: !!selectedChannelId,
  });

  const channels = channelsData?.data || [];
  const programs = scheduleData?.programs || [];

  // Auto-select first channel
  React.useEffect(() => {
    if (!selectedChannelId && channels.length > 0) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentProgram = (startIso: string, endIso: string) => {
    const now = new Date().getTime();
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    return now >= start && now < end;
  };

  const calculateProgress = (startIso: string, endIso: string) => {
    const now = new Date().getTime();
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    if (now < start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-indigo-400" />
            <span>EPG Elektronik Program Rehberi</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kanal bazlı günlük yayın akışını takip edin, şu an ve sonraki programları görüntüleyin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Bugün: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Channels on Left, Schedule Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Column: Channels Selector */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kanal listesinde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[500px]">
              {isLoadingChannels ? (
                <div className="p-8 text-center text-xs text-slate-500">Kanallar yükleniyor...</div>
              ) : channels.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">Kanal bulunamadı.</div>
              ) : (
                channels.map((ch) => {
                  const isSelected = selectedChannelId === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChannelId(ch.id)}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
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
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-700' : 'bg-slate-800'}`}>
                          <Tv className="w-4 h-4" />
                        </div>
                      )}
                      <div className="overflow-hidden flex-1">
                        <div className="text-xs font-semibold truncate">{ch.name}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {ch.group_title}
                        </div>
                      </div>
                      {isSelected && <ChevronRight className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Schedule Timeline */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {scheduleData?.channel?.name || 'Seçili Kanal Akışı'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {programs.length > 0 ? `${programs.length} Program Listelendi` : 'Yayın Akışı'}
                  </span>
                </div>
              </div>
            </div>

            {/* Program Timeline List */}
            {isLoadingSchedule ? (
              <div className="p-16 text-center text-xs text-slate-500">Program akışı yükleniyor...</div>
            ) : programs.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <Info className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">EPG Bilgisi Bulunamadı</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Bu kanal için henüz eşleşen bir EPG (XMLTV) veri kaynağı bulunmamaktadır. Ayarlar veya Playlist ekranından EPG XML linkinizi tanımlayabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {programs.map((prog) => {
                  const isLive = isCurrentProgram(prog.start_time, prog.end_time);
                  const progress = calculateProgress(prog.start_time, prog.end_time);

                  return (
                    <div
                      key={prog.id}
                      onClick={() => setSelectedProgram(prog)}
                      className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden ${
                        isLive
                          ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Live progress indicator bar */}
                      {isLive && (
                        <div
                          className="absolute bottom-0 left-0 top-0 bg-indigo-500/10 pointer-events-none transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      )}

                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold shrink-0 ${
                            isLive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {formatTime(prog.start_time)} - {formatTime(prog.end_time)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {isLive && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                  Şu An
                                </span>
                              )}
                              <h4 className="text-sm font-bold text-white">{prog.title}</h4>
                            </div>
                            {prog.description && (
                              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{prog.description}</p>
                            )}
                          </div>
                        </div>

                        {isLive && (
                          <span className="text-[11px] font-semibold text-indigo-400 shrink-0 self-end sm:self-center">
                            %{progress} Tamamlandı
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedProgram(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {formatTime(selectedProgram.start_time)} - {formatTime(selectedProgram.end_time)}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-3">{selectedProgram.title}</h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {selectedProgram.description || 'Bu program için ayrıntılı açıklama bulunmamaktadır.'}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProgram(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
