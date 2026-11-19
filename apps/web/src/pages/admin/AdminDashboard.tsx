import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Shield, Users, ListPlus, Tv, Smartphone, Server, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminStatsResponse {
  stats: {
    total_users: number;
    total_playlists: number;
    total_channels: number;
    total_devices: number;
    subscriptions: {
      free: number;
      premium: number;
      pro: number;
    };
  };
  system: {
    php_version: string;
    laravel_version: string;
    server_time: string;
    database_status: string;
  };
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    active_subscription?: {
      tier: string;
    };
  }>;
}

export const AdminDashboard: React.FC = () => {
  const { data, isLoading } = useQuery<AdminStatsResponse>({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats');
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="p-16 text-center text-xs text-slate-500">Yönetim verileri yükleniyor...</div>;
  }

  const stats = data?.stats;
  const system = data?.system;
  const recentUsers = data?.recent_users || [];

  const totalSubs = (stats?.subscriptions.free || 0) + (stats?.subscriptions.premium || 0) + (stats?.subscriptions.pro || 0) || 1;
  const proPercent = Math.round(((stats?.subscriptions.pro || 0) / totalSubs) * 100);
  const premPercent = Math.round(((stats?.subscriptions.premium || 0) / totalSubs) * 100);
  const freePercent = 100 - proPercent - premPercent;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Sistem Yönetim Paneli</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Yönetici Kontrol Merkezi</h1>
          <p className="text-sm text-slate-400 mt-1">Sistem istatistiklerini, paket dağılımlarını ve kullanıcıları denetleyin.</p>
        </div>

        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Users className="w-4 h-4" />
          <span>Kullanıcıları Yönet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Toplam Kullanıcı</span>
            <div className="text-2xl font-bold text-white mt-1">{stats?.total_users || 0}</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Kayıtlı Playlistler</span>
            <div className="text-2xl font-bold text-white mt-1">{stats?.total_playlists || 0}</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ListPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Sistemdeki Kanallar</span>
            <div className="text-2xl font-bold text-white mt-1">{stats?.total_channels || 0}</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Tv className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Aktif Cihazlar</span>
            <div className="text-2xl font-bold text-white mt-1">{stats?.total_devices || 0}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Subscription Breakdown & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriptions */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">Abonelik Paketi Dağılımı</h3>
          <p className="text-xs text-slate-400">Kullanıcıların mevcut lisans paketlerine göre oranları.</p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Pro Paket ({stats?.subscriptions.pro || 0})</span>
                <span className="text-purple-400 font-bold">%{proPercent}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${proPercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Premium Paket ({stats?.subscriptions.premium || 0})</span>
                <span className="text-indigo-400 font-bold">%{premPercent}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${premPercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Free Paket ({stats?.subscriptions.free || 0})</span>
                <span className="text-slate-400 font-bold">%{freePercent}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-slate-500 rounded-full" style={{ width: `${freePercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Sistem ve Servis Durumu</h3>
          </div>
          <p className="text-xs text-slate-400">Backend API, veritabanı ve ortam parametreleri.</p>

          <div className="space-y-2.5 text-xs pt-1">
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">PHP Sürümü</span>
              <span className="text-slate-200 font-mono font-medium">{system?.php_version}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Laravel Sürümü</span>
              <span className="text-slate-200 font-mono font-medium">{system?.laravel_version}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Veritabanı Motoru</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MySQL 8.4 (Bağlı)</span>
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Sunucu Zamanı</span>
              <span className="text-slate-300 font-mono text-[11px]">{system?.server_time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base">Son Kaydolan Kullanıcılar</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3">Kullanıcı</th>
                <th className="pb-3">E-posta</th>
                <th className="pb-3">Rol</th>
                <th className="pb-3">Paket</th>
                <th className="pb-3">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentUsers.map((u) => (
                <tr key={u.id} className="text-slate-300">
                  <td className="py-3 font-semibold text-white">{u.name}</td>
                  <td className="py-3 text-slate-400">{u.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-purple-400 font-semibold uppercase">{u.active_subscription?.tier || 'Free'}</span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
