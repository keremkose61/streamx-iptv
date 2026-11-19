import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../api/client';
import { User, Shield, Sliders, Check, Lock, AlertCircle } from 'lucide-react';

interface BackendSettings {
  preferred_player: string;
  buffer_length_seconds: number;
  theme: string;
  language: string;
  parental_control_enabled: boolean;
}

export const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [bufferSec, setBufferSec] = useState(30);
  const [playerEngine, setPlayerEngine] = useState('auto');
  const [parentalEnabled, setParentalEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch settings from API
  const { data: settingsData } = useQuery<{ settings: BackendSettings }>({
    queryKey: ['user_settings'],
    queryFn: async () => {
      const res = await apiClient.get('/settings');
      return res.data;
    },
  });

  useEffect(() => {
    if (settingsData?.settings) {
      setBufferSec(settingsData.settings.buffer_length_seconds || 30);
      setPlayerEngine(settingsData.settings.preferred_player || 'auto');
      setParentalEnabled(settingsData.settings.parental_control_enabled || false);
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg('');
      const payload: any = {
        buffer_length_seconds: bufferSec,
        preferred_player: playerEngine,
        parental_control_enabled: parentalEnabled,
      };
      if (pin && pin.length === 4) {
        payload.parental_pin = pin;
      }
      const res = await apiClient.put('/settings', payload);
      return res.data;
    },
    onSuccess: () => {
      setSaved(true);
      setPin('');
      queryClient.invalidateQueries({ queryKey: ['user_settings'] });
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Ayarlar kaydedilemedi.');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
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
          <span>Ayarlar sunucu ile başarıyla senkronize edildi.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
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

      {/* Player Settings & Parental Control Form */}
      <form onSubmit={handleSave} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
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
        </div>

        {/* Parental Control */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">Ebeveyn Denetimi ve PIN Koruması</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800">
              <div>
                <span className="text-sm font-semibold text-white block">Ebeveyn Kontrolü</span>
                <span className="text-xs text-slate-400">Yetişkin veya kilitli kanalları 4 haneli PIN ile koruyun.</span>
              </div>
              <input
                type="checkbox"
                checked={parentalEnabled}
                onChange={(e) => setParentalEnabled(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {parentalEnabled && (
              <div className="max-w-xs">
                <label className="block text-xs text-slate-400 font-medium mb-1">Yeni 4 Haneli PIN Kodu</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono tracking-widest text-center"
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};
