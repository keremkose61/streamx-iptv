import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { Check, Shield, Zap, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Plan {
  id: 'free' | 'premium' | 'pro';
  name: string;
  price: number;
  currency: string;
  interval: string;
  is_popular?: boolean;
  description: string;
  features: string[];
  limits: {
    max_playlists: number;
    max_devices: number;
    unlimited_epg: boolean;
  };
}

interface CurrentSubscriptionData {
  subscription: {
    tier: 'free' | 'premium' | 'pro';
    max_playlists: number;
    max_devices: number;
    expires_at: string | null;
  };
  usage: {
    playlists: { used: number; max: number };
    devices: { used: number; max: number };
  };
}

export const Pricing: React.FC = () => {
  const queryClient = useQueryClient();
  const { fetchProfile } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch plans
  const { data: plansData, isLoading: isLoadingPlans } = useQuery<{ plans: Plan[] }>({
    queryKey: ['subscription_plans'],
    queryFn: async () => {
      const res = await apiClient.get('/subscriptions/plans');
      return res.data;
    },
  });

  // Fetch current subscription
  const { data: currentData } = useQuery<CurrentSubscriptionData>({
    queryKey: ['current_subscription'],
    queryFn: async () => {
      const res = await apiClient.get('/subscriptions/current');
      return res.data;
    },
  });

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: async (tier: 'free' | 'premium' | 'pro') => {
      setErrorMsg('');
      const res = await apiClient.post('/subscriptions/upgrade', { tier });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMsg(data.message || 'Paketiniz başarıyla güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['current_subscription'] });
      fetchProfile();
      setTimeout(() => setSuccessMsg(''), 3500);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Yükseltme işlemi gerçekleştirilemedi.');
    },
  });

  const plans = plansData?.plans || [];
  const currentTier = currentData?.subscription?.tier || 'free';
  const usage = currentData?.usage;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Esnek ve Şeffaf Abonelik Paketleri</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          İhtiyacınıza Uygun StreamX Paketini Seçin
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Kendi M3U listelerinizi dilediğiniz ekranda kısıtlama olmadan yönetin, gelişmiş EPG ve tampon optimizasyonunun keyfini çıkarın.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 max-w-xl mx-auto justify-center">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 max-w-xl mx-auto justify-center">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Current Usage Banner */}
      {usage && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-3xl mx-auto">
          <div>
            <span className="text-xs text-slate-400 font-medium">Mevcut Durumunuz:</span>
            <div className="text-sm font-bold text-white capitalize">{currentTier} Paketi</div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block mb-0.5">Playlist Kullanımı</span>
              <span className="font-bold text-white">{usage.playlists.used} / {usage.playlists.max} Adet</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block mb-0.5">Cihaz Erişimi</span>
              <span className="font-bold text-white">{usage.devices.used} / {usage.devices.max} Cihaz</span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      {isLoadingPlans ? (
        <div className="p-16 text-center text-xs text-slate-500">Paketler yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => {
            const isCurrent = currentTier === p.id;
            const isPopular = p.is_popular;

            return (
              <div
                key={p.id}
                className={`relative p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 backdrop-blur-sm ${
                  isPopular
                    ? 'bg-gradient-to-b from-indigo-950/60 via-slate-900/90 to-slate-900 border-indigo-500 shadow-2xl shadow-indigo-950/50 scale-105 z-10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg">
                    En Çok Tercih Edilen
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    {p.id === 'pro' && <Zap className="w-5 h-5 text-purple-400" />}
                    {p.id === 'premium' && <Shield className="w-5 h-5 text-indigo-400" />}
                  </div>

                  <p className="text-xs text-slate-400 mb-6 min-h-[32px]">{p.description}</p>

                  <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-slate-800">
                    <span className="text-4xl font-extrabold text-white tracking-tight">{p.price}</span>
                    <span className="text-slate-400 text-sm font-semibold">{p.currency}</span>
                    <span className="text-slate-500 text-xs">/ {p.interval}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <button
                    disabled={isCurrent || upgradeMutation.isPending}
                    onClick={() => upgradeMutation.mutate(p.id)}
                    className={`w-full py-3 rounded-xl font-semibold text-xs transition shadow-lg ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                        : isPopular
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {isCurrent ? 'Mevcut Paketiniz' : upgradeMutation.isPending ? 'İşleniyor...' : `${p.name} Seç`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
