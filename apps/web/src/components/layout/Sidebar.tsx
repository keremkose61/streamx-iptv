import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LayoutDashboard, Tv, Calendar, ListPlus, Heart, History, Settings, Shield, CreditCard } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/live', label: 'Canlı TV', icon: Tv },
    { to: '/epg', label: 'EPG Rehberi', icon: Calendar },
    { to: '/playlists', label: 'Playlistler', icon: ListPlus },
    { to: '/favorites', label: 'Favoriler', icon: Heart },
    { to: '/history', label: 'İzleme Geçmişi', icon: History },
    { to: '/pricing', label: 'Paketler & Lisans', icon: CreditCard },
    { to: '/settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {user?.role === 'admin' && (
          <div className="pt-4 border-t border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 px-3 block mb-2">
              Yönetim
            </span>
            <div className="space-y-1">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
                  }`
                }
              >
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Admin Paneli</span>
              </NavLink>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
        <div className="font-semibold text-slate-300 mb-1">StreamX v0.1.0</div>
        <p className="leading-relaxed">Enterprise IPTV oynatıcı ve medya yönetim platformu.</p>
      </div>
    </aside>
  );
};
