<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Subscription;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['activeSubscription', 'playlists' => fn($q) => $q->withoutGlobalScopes()]);

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('email', 'LIKE', "%{$term}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(25);

        return response()->json($users);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'role' => ['nullable', 'in:user,admin'],
            'tier' => ['nullable', 'in:free,premium,pro'],
            'max_playlists' => ['nullable', 'integer', 'min:1', 'max:50'],
            'max_devices' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        if ($request->filled('role')) {
            $user->update(['role' => $request->role]);
        }

        if ($request->filled('tier')) {
            $maxPlaylists = $request->max_playlists ?? ($request->tier === 'pro' ? 10 : ($request->tier === 'premium' ? 3 : 1));
            $maxDevices = $request->max_devices ?? ($request->tier === 'pro' ? 5 : ($request->tier === 'premium' ? 2 : 1));

            Subscription::withoutGlobalScopes()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'tier' => $request->tier,
                    'max_playlists' => $maxPlaylists,
                    'max_devices' => $maxDevices,
                ]
            );
        }

        return response()->json([
            'message' => 'Kullanıcı yetkileri ve abonelik paketi güncellendi.',
            'user' => $user->fresh()->load('activeSubscription'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Kendi yönetici hesabınızı silemezsiniz.'], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'Kullanıcı ve ilişkili tüm verileri başarıyla silindi.',
        ]);
    }
}
