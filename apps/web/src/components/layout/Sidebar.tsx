import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Tv, Calendar, ListPlus, Heart, History, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/live', label: 'Canlı TV', icon: Tv },
    { to: '/epg', label: 'EPG Rehberi', icon: Calendar },
    { to: '/playlists', label: 'Playlistler', icon: ListPlus },
    { to: '/favorites', label: 'Favoriler', icon: Heart },
    { to: '/history', label: 'İzleme Geçmişi', icon: History },
    { to: '/settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4 flex flex-col justify-between shrink-0">
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

      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
        <div className="font-semibold text-slate-300 mb-1">StreamX v0.1.0</div>
        <p className="leading-relaxed">Enterprise IPTV oynatıcı ve medya yönetim platformu.</p>
      </div>
    </aside>
  );
};
