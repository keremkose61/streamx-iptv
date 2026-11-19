import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ListPlus, Plus, RefreshCw, Trash2, Tv, AlertCircle, CheckCircle2, Globe, FileUp, X, Search } from 'lucide-react';

interface Playlist {
  id: number;
  title: string;
  source_type: 'url' | 'file';
  source_url: string | null;
  channel_count: number;
  last_synced_at: string | null;
  status: string;
}

interface Channel {
  id: number;
  name: string;
  group_title: string;
  stream_url: string;
  logo_url: string | null;
}

export const Playlists: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState<'url' | 'file'>('url');
  const [sourceUrl, setSourceUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Channel drawer filter state
  const [channelSearch, setChannelSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  // Fetch Playlists
  const { data: playlistsData, isLoading } = useQuery<{ playlists: Playlist[] }>({
    queryKey: ['playlists'],
    queryFn: async () => {
      const res = await apiClient.get('/playlists');
      return res.data;
    },
  });

  // Fetch distinct groups
  const { data: groupsData } = useQuery<{ groups: { group_title: string; total: number }[] }>({
    queryKey: ['channel_groups', selectedPlaylistId],
    queryFn: async () => {
      if (!selectedPlaylistId) return { groups: [] };
      const res = await apiClient.get(`/channels/groups?playlist_id=${selectedPlaylistId}`);
      return res.data;
    },
    enabled: !!selectedPlaylistId,
  });

  // Fetch Channels of selected playlist
  const { data: channelsData, isLoading: isLoadingChannels } = useQuery<{ data: Channel[] }>({
    queryKey: ['channels', selectedPlaylistId, selectedGroup, channelSearch],
    queryFn: async () => {
      if (!selectedPlaylistId) return { data: [] };
      const params = new URLSearchParams();
      params.append('playlist_id', selectedPlaylistId.toString());
      if (selectedGroup) params.append('group', selectedGroup);
      if (channelSearch) params.append('search', channelSearch);
      const res = await apiClient.get(`/channels?${params.toString()}`);
      return res.data;
    },
    enabled: !!selectedPlaylistId,
  });

  // Create Playlist Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg('');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('source_type', sourceType);

      if (sourceType === 'url') {
        formData.append('source_url', sourceUrl);
      } else if (file) {
        formData.append('file', file);
      }

      const res = await apiClient.post('/playlists', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccessMsg('Playlist başarıyla eklendi ve kanallar ayrıştırıldı!');
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setTimeout(() => {
        setIsModalOpen(false);
        setTitle('');
        setSourceUrl('');
        setFile(null);
        setSuccessMsg('');
      }, 1500);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Playlist eklenirken hata oluştu.');
    },
  });

  // Sync Mutation
  const syncMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.post(`/playlists/${id}/sync`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      alert('Playlist başarıyla güncellendi.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Senkronizasyon başarısız.');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/playlists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      if (selectedPlaylistId) setSelectedPlaylistId(null);
    },
  });

  const playlists = playlistsData?.playlists || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Playlist Yönetimi</h1>
          <p className="text-sm text-slate-400 mt-1">M3U ve M3U8 formatındaki yayın kaynaklarınızı ekleyin ve yönetin.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Playlist Ekle</span>
        </button>
      </div>

      {/* Playlist Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Playlistler yükleniyor...</div>
      ) : playlists.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <ListPlus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Henüz Bir Playlist Eklenmedi</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Kendi sahip olduğunuz veya kullanma yetkisine sahip olduğunuz bir M3U linki ya da dosyası yükleyerek hemen başlayın.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Playlistini Ekle</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className={`p-6 rounded-2xl border transition backdrop-blur-sm flex flex-col justify-between ${
                selectedPlaylistId === pl.id
                  ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border uppercase flex items-center gap-1.5 ${
                    pl.source_type === 'url' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {pl.source_type === 'url' ? <Globe className="w-3 h-3" /> : <FileUp className="w-3 h-3" />}
                    {pl.source_type === 'url' ? 'URL Kaynağı' : 'Yerel Dosya'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {pl.last_synced_at ? new Date(pl.last_synced_at).toLocaleDateString('tr-TR') : 'Senkronize edilmedi'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 truncate">{pl.title}</h3>
                <div className="text-sm text-slate-400 flex items-center gap-1.5 mb-4">
                  <Tv className="w-4 h-4 text-indigo-400" />
                  <span>{pl.channel_count} Aktif Kanal</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedPlaylistId(selectedPlaylistId === pl.id ? null : pl.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold border border-indigo-500/20 transition"
                >
                  {selectedPlaylistId === pl.id ? 'Paneli Kapat' : 'Kanalları İncele'}
                </button>

                <div className="flex items-center gap-1">
                  {pl.source_type === 'url' && (
                    <button
                      onClick={() => syncMutation.mutate(pl.id)}
                      disabled={syncMutation.isPending}
                      title="Yeniden Senkronize Et"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`"${pl.title}" playlistini ve bağlı tüm kanalları silmek istediğinize emin misiniz?`)) {
                        deleteMutation.mutate(pl.id);
                      }
                    }}
                    title="Sil"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Playlist Channels Explorer */}
      {selectedPlaylistId && (
        <div className="mt-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Kanal Tarayıcısı</h2>
              <p className="text-xs text-slate-400">Seçili playliste ait kanalları filtreleyin ve yayın adreslerini inceleyin.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Tüm Kategoriler</option>
                {(groupsData?.groups || []).map((g) => (
                  <option key={g.group_title} value={g.group_title}>
                    {g.group_title} ({g.total})
                  </option>
                ))}
              </select>

              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Kanal ara..."
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={() => setSelectedPlaylistId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isLoadingChannels ? (
            <div className="p-8 text-center text-slate-500 text-xs">Kanallar yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2">
              {(channelsData?.data || []).map((ch) => (
                <div key={ch.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex items-center gap-3">
                  {ch.logo_url ? (
                    <img src={ch.logo_url} alt="" className="w-10 h-10 object-contain rounded-lg bg-slate-900 shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-400">
                      <Tv className="w-5 h-5" />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <div className="text-sm font-semibold text-slate-200 truncate">{ch.name}</div>
                    <div className="text-xs text-indigo-400 truncate">{ch.group_title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Playlist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Yeni Playlist Ekle</h2>
            <p className="text-xs text-slate-400 mb-6">M3U kaynaklarınızı güvenle platforma bağlayın.</p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Playlist Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ev Spor & Belgesel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kaynak Türü</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceType('url')}
                    className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                      sourceType === 'url' ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>M3U URL Bağlantısı</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('file')}
                    className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                      sourceType === 'file' ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Dosya Yükle (.m3u)</span>
                  </button>
                </div>
              </div>

              {sourceType === 'url' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">M3U / M3U8 URL Adresi</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/playlist.m3u"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    URL adresi sunucu tarafında SSRF güvenlik kontrolünden geçirildikten sonra indirilir.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">M3U Dosyası Seç</label>
                  <input
                    type="file"
                    required
                    accept=".m3u,.m3u8,text/plain"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Ayrıştırılıyor...' : 'Playlisti Yükle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
