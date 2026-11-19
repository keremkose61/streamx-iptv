import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Tv, LogOut, User as UserIcon, Shield, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'premium':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-600/30';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Tv className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            StreamX
          </span>
          <span className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            IPTV
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Kanal, grup veya program ara..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium uppercase px-2 py-0.5 rounded-full border ${getTierBadge(user.subscription?.tier)}`}>
              {user.subscription?.tier || 'Free'}
            </span>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-slate-200 leading-tight">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
            </div>

            {user.role === 'admin' && (
              <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Admin">
                <Shield className="w-4 h-4" />
              </span>
            )}

            <button
              onClick={() => logout()}
              title="Çıkış Yap"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
