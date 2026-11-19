import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { Tv, ListPlus, Heart, History, Play, Plus, Zap, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Kayıtlı Playlist', value: '0', limit: user?.subscription?.max_playlists || 1, icon: ListPlus, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { label: 'Aktif Kanallar', value: '0', icon: Tv, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Favori Kanallar', value: '0', icon: Heart, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
    { label: 'Son İzlenenler', value: '0', icon: History, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/40 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Kurumsal IPTV Deneyimi</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Hoş Geldiniz, {user?.name || 'Kullanıcı'}!
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            StreamX ile kendi M3U/M3U8 çalma listelerinizi güvenle bağlayabilir, EPG program rehberini takip edebilir ve yüksek kaliteli canlı yayınlarınızı izleyebilirsiniz.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/playlists"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Playlist Ekle</span>
            </Link>
            <Link
              to="/live"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              <Play className="w-4 h-4" />
              <span>Canlı TV Oynatıcı</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                <div className="text-2xl font-bold text-white mt-1">
                  {s.value}
                  {s.limit && <span className="text-xs text-slate-500 font-normal"> / {s.limit}</span>}
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100">Güvenlik ve İzolasyon Durumu</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Tüm çalma listeleri ve kullanıcı tercihleri uçtan uca tenant izolasyonu altındadır. Harici M3U/XML bağlantılarında SSRF koruma katmanı aktiftir.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Veri İzolasyonu (TenantScope)</span>
              <span className="text-emerald-400 font-medium">Aktif</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">SSRF Filtreleme Servisi</span>
              <span className="text-emerald-400 font-medium">Aktif</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Sanctum Token Güvenliği</span>
              <span className="text-emerald-400 font-medium">Aktif</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <Tv className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100">Oynatıcı ve Akış Desteği</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Platform çoklu oynatıcı motoru mimarisine sahiptir. HLS (m3u8) ve DASH (mpd) canlı yayın akışları otomatik tespit edilerek oynatılır.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">HLS.js Entegrasyonu</span>
              <span className="text-indigo-400 font-medium">Hazır (player-core)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">XMLTV EPG Eşleme</span>
              <span className="text-indigo-400 font-medium">Hazır (epg-engine)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Tampon Süresi</span>
              <span className="text-slate-200 font-medium">{user?.settings?.buffer_length_seconds || 30} saniye</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
