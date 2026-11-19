import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { History as HistoryIcon, Play, Tv, Trash2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Channel {
  id: number;
  name: string;
  group_title: string;
  logo_url: string | null;
}

interface HistoryItem {
  id: number;
  channel_id: number;
  channel: Channel;
  watched_at: string;
}

export const History: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<{ data: HistoryItem[] }>({
    queryKey: ['watch_history'],
    queryFn: async () => {
      const res = await apiClient.get('/history');
      return res.data;
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete('/history');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch_history'] });
    },
  });

  const historyList = data?.data || [];

  const formatWatchedDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <HistoryIcon className="w-6 h-6 text-amber-400" />
            <span>İzleme Geçmişi</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">En son izlediğiniz kanalların zaman akışı.</p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Tüm izleme geçmişinizi temizlemek istediğinize emin misiniz?')) {
                clearMutation.mutate();
              }
            }}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Geçmişi Temizle</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-xs text-slate-500">İzleme geçmişi yükleniyor...</div>
      ) : historyList.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">İzleme Geçmişiniz Boş</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Canlı TV izlemeye başladığınızda kanallarınız otomatik olarak burada listelenecektir.
          </p>
          <button
            onClick={() => navigate('/live')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Canlı TV'ye Başla</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {historyList.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 overflow-hidden">
                {item.channel?.logo_url ? (
                  <img
                    src={item.channel.logo_url}
                    alt=""
                    className="w-10 h-10 rounded-xl object-contain bg-slate-950 shrink-0 p-1 border border-slate-800"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-400">
                    <Tv className="w-5 h-5" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm text-white truncate">{item.channel?.name || 'Kanal'}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-indigo-400 font-medium">{item.channel?.group_title || 'Genel'}</span>
                    <span className="text-slate-600 text-xs">•</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatWatchedDate(item.watched_at)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/live')}
                className="px-4 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-indigo-500/20 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Tekrar İzle</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
