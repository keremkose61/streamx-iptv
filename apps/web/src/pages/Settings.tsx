import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, Shield, Sliders, Check } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const [bufferSec, setBufferSec] = useState(user?.settings?.buffer_length_seconds || 30);
  const [playerEngine, setPlayerEngine] = useState(user?.settings?.preferred_player || 'auto');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Kullanıcı ve Oynatıcı Ayarları</h1>
        <p className="text-sm text-slate-400 mt-1">Hesabınızı, oynatıcı parametrelerinizi ve lisans limitlerinizi yönetin.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Ayarlar başarıyla kaydedildi.</span>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">Profil Bilgileri</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Ad Soyad</label>
            <input
              type="text"
              disabled
              value={user?.name || ''}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">E-posta</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Subscription Tier */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-slate-100">Abonelik ve Paket Bilgileri</h2>
          </div>
          <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {user?.subscription?.tier || 'Free'} Paketi
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">İzin Verilen Playlist Sayısı</span>
            <span className="text-lg font-bold text-white">{user?.subscription?.max_playlists || 1} Adet</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">Maksimum Cihaz Erişimi</span>
            <span className="text-lg font-bold text-white">{user?.subscription?.max_devices || 1} Cihaz</span>
          </div>
        </div>
      </div>

      {/* Player Settings */}
      <form onSubmit={handleSave} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-slate-100">Oynatıcı Parametreleri</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Tercih Edilen Oynatıcı Motoru</label>
            <select
              value={playerEngine}
              onChange={(e) => setPlayerEngine(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="auto">Otomatik Seçim (HLS / DASH Hibrit)</option>
              <option value="hlsjs">HLS.js Motoru</option>
              <option value="dashjs">Dash.js Motoru</option>
              <option value="native">Tarayıcı Yerel Oynatıcı</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Yayın Tamponlama Süresi (Saniye)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={bufferSec}
              onChange={(e) => setBufferSec(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};
