import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Heart, Play, Tv, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Channel {
  id: number;
  name: string;
  group_title: string;
  stream_url: string;
  logo_url: string | null;
}

interface FavoriteItem {
  id: number;
  channel_id: number;
  channel: Channel;
  created_at: string;
}

export const Favorites: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<{ favorites: FavoriteItem[] }>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await apiClient.get('/favorites');
      return res.data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (channelId: number) => {
      await apiClient.post(`/favorites/${channelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const favorites = data?.favorites || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            <span>Favori Kanallarım</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Sık izlediğiniz kanallara hızlıca erişin.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
          {favorites.length} Favori Kanal
        </span>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-xs text-slate-500">Favoriler yükleniyor...</div>
      ) : favorites.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Henüz Favori Kanal Eklenmedi</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Canlı TV ekranında veya kanal listesinde kalp simgesine tıklayarak favorilerinizi buraya ekleyebilirsiniz.
          </p>
          <button
            onClick={() => navigate('/live')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Canlı TV'ye Git</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div className="flex items-start gap-3 mb-4">
                {fav.channel?.logo_url ? (
                  <img
                    src={fav.channel.logo_url}
                    alt=""
                    className="w-12 h-12 rounded-xl object-contain bg-slate-950 shrink-0 p-1 border border-slate-800"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-400">
                    <Tv className="w-6 h-6" />
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <h3 className="font-bold text-sm text-white truncate">{fav.channel?.name || 'Kanal'}</h3>
                  <span className="text-xs text-indigo-400 font-medium truncate block mt-0.5">
                    {fav.channel?.group_title || 'Genel'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 gap-2">
                <button
                  onClick={() => navigate('/live')}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition flex-1 justify-center border border-indigo-500/30"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>İzle</span>
                </button>

                <button
                  onClick={() => removeMutation.mutate(fav.channel_id)}
                  title="Favorilerden Çıkar"
                  className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
