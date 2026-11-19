import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import { Shield, Search, Edit3, Trash2, X, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  active_subscription?: {
    tier: 'free' | 'premium' | 'pro';
    max_playlists: number;
    max_devices: number;
  };
  playlists?: any[];
}

export const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const currentAdmin = useAuthStore((s) => s.user);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Edit Modal form states
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editTier, setEditTier] = useState<'free' | 'premium' | 'pro'>('free');
  const [maxPlaylists, setMaxPlaylists] = useState(1);
  const [maxDevices, setMaxDevices] = useState(1);
  const [editSuccess, setEditSuccess] = useState(false);

  // Fetch users
  const { data, isLoading } = useQuery<{ data: UserItem[] }>({
    queryKey: ['admin_users', search, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      const res = await apiClient.get(`/admin/users?${params.toString()}`);
      return res.data;
    },
  });

  const users = data?.data || [];

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditTier(u.active_subscription?.tier || 'free');
    setMaxPlaylists(u.active_subscription?.max_playlists || 1);
    setMaxDevices(u.active_subscription?.max_devices || 1);
    setEditSuccess(false);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingUser) return;
      await apiClient.put(`/admin/users/${editingUser.id}`, {
        role: editRole,
        tier: editTier,
        max_playlists: maxPlaylists,
        max_devices: maxDevices,
      });
    },
    onSuccess: () => {
      setEditSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
      setTimeout(() => {
        setEditingUser(null);
        setEditSuccess(false);
      }, 1200);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Kontrol Merkezine Dön</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kullanıcı ve Yetki Yönetimi</h1>
          <p className="text-sm text-slate-400 mt-1">Platformdaki tüm kullanıcıları inceleyin, paketlerini ve yönetici rollerini güncelleyin.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="İsim veya e-posta ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Tüm Roller</option>
          <option value="user">Standart Kullanıcı</option>
          <option value="admin">Yönetici (Admin)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-16 text-center text-xs text-slate-500">Kullanıcılar taranıyor...</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">Eşleşen kullanıcı bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Ad Soyad</th>
                  <th className="py-3.5 px-6">E-posta</th>
                  <th className="py-3.5 px-6">Rol</th>
                  <th className="py-3.5 px-6">Abonelik Paketi</th>
                  <th className="py-3.5 px-6">Playlist Sınırı</th>
                  <th className="py-3.5 px-6">Kayıt Tarihi</th>
                  <th className="py-3.5 px-6 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const isSelf = currentAdmin?.id === u.id;
                  return (
                    <tr key={u.id} className="text-slate-300 hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6 font-semibold text-white flex items-center gap-2">
                        <span>{u.name}</span>
                        {isSelf && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Siz
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-400">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-purple-400 font-bold uppercase">{u.active_subscription?.tier || 'Free'}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {u.playlists?.length || 0} / {u.active_subscription?.max_playlists || 1}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            title="Düzenle"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {!isSelf && (
                            <button
                              onClick={() => {
                                if (confirm(`"${u.name}" kullanıcısını ve tüm verilerini silmek istediğinize emin misiniz?`)) {
                                  deleteMutation.mutate(u.id);
                                }
                              }}
                              title="Sil"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Kullanıcı Düzenle</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">{editingUser.name} ({editingUser.email})</p>

            {editSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Kullanıcı yetkileri güncellendi!</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Sistem Rolü</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="user">Standart Kullanıcı</option>
                  <option value="admin">Yönetici (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Abonelik Paketi</label>
                <select
                  value={editTier}
                  onChange={(e) => {
                    const t = e.target.value as any;
                    setEditTier(t);
                    if (t === 'pro') {
                      setMaxPlaylists(10);
                      setMaxDevices(5);
                    } else if (t === 'premium') {
                      setMaxPlaylists(3);
                      setMaxDevices(2);
                    } else {
                      setMaxPlaylists(1);
                      setMaxDevices(1);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="free">Free (Ücretsiz)</option>
                  <option value="premium">Premium</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Maksimum Playlist</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={maxPlaylists}
                    onChange={(e) => setMaxPlaylists(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Maksimum Cihaz</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={maxDevices}
                    onChange={(e) => setMaxDevices(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Kaydediliyor...' : 'Değişiklikleri Uygula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
