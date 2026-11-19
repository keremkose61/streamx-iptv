<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Contracts\PaymentGatewayInterface;
use App\Services\Payment\MockPaymentGateway;
use App\Models\Subscription;
use App\Models\Playlist;
use App\Models\UserDevice;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    protected PaymentGatewayInterface $gateway;

    public function __construct()
    {
        // Provider-agnostic: resolves configured gateway (default to mock)
        $this->gateway = new MockPaymentGateway();
    }

    /**
     * Get available subscription plans and limits.
     */
    public function plans()
    {
        $plans = [
            [
                'id' => 'free',
                'name' => 'Free (Başlangıç)',
                'price' => 0,
                'currency' => 'TL',
                'interval' => 'Süresiz',
                'description' => 'Temel IPTV oynatma ve tek playlist yönetimi.',
                'features' => [
                    '1 Adet M3U/M3U8 Playlist',
                    '1 Cihaz Erişimi (Web)',
                    'Standart HLS Oynatıcı',
                    'Manuel EPG Eşleme',
                    'Topluluk Desteği',
                ],
                'limits' => [
                    'max_playlists' => 1,
                    'max_devices' => 1,
                    'unlimited_epg' => false,
                ],
            ],
            [
                'id' => 'premium',
                'name' => 'Premium',
                'price' => 79,
                'currency' => 'TL',
                'interval' => 'Ay',
                'is_popular' => true,
                'description' => 'Gelişmiş kanal yönetimi ve çoklu ekran desteği.',
                'features' => [
                    '3 Adet M3U/M3U8 Playlist',
                    '2 Eşzamanlı Cihaz (Web + Masaüstü)',
                    'Otomatik 24 Saatlik EPG Senkronizasyonu',
                    'Düşük Gecikmeli (Low-Latency) HLS',
                    'Ebeveyn Denetimi ve PIN Koruması',
                    'Öncelikli E-posta Desteği',
                ],
                'limits' => [
                    'max_playlists' => 3,
                    'max_devices' => 2,
                    'unlimited_epg' => true,
                ],
            ],
            [
                'id' => 'pro',
                'name' => 'Pro (Sınırsız Aile)',
                'price' => 149,
                'currency' => 'TL',
                'interval' => 'Ay',
                'description' => 'Smart TV dahil tüm cihazlarda sınırsız eğlence.',
                'features' => [
                    '10 Adet M3U/M3U8 Playlist',
                    '5 Eşzamanlı Cihaz (Web, TV, Android, Desktop)',
                    'Tüm Cihazlar Arası Bulut Senkronizasyonu',
                    'Sınırsız Çoklu EPG Kaynağı',
                    'Gelişmiş Kanal Sıralama ve Gruplama',
                    '7/24 VIP Destek',
                ],
                'limits' => [
                    'max_playlists' => 10,
                    'max_devices' => 5,
                    'unlimited_epg' => true,
                ],
            ],
        ];

        return response()->json([
            'plans' => $plans,
        ]);
    }

    /**
     * Get current subscription & usage metrics.
     */
    public function current(Request $request)
    {
        $user = $request->user();
        $sub = $user->activeSubscription;

        $playlistCount = Playlist::where('user_id', $user->id)->count();
        $deviceCount = UserDevice::where('user_id', $user->id)->count();

        return response()->json([
            'subscription' => $sub,
            'usage' => [
                'playlists' => [
                    'used' => $playlistCount,
                    'max' => $sub->max_playlists ?? 1,
                ],
                'devices' => [
                    'used' => $deviceCount,
                    'max' => $sub->max_devices ?? 1,
                ],
            ],
        ]);
    }

    /**
     * Create checkout session for selected plan.
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'tier' => ['required', 'in:premium,pro'],
        ]);

        $session = $this->gateway->createCheckoutSession($request->user(), $request->tier);

        return response()->json([
            'checkout' => $session,
        ]);
    }

    /**
     * Complete upgrade (Simulated/Provider callback).
     */
    public function upgrade(Request $request)
    {
        $request->validate([
            'tier' => ['required', 'in:free,premium,pro'],
        ]);

        $user = $request->user();
        $tier = $request->tier;

        $maxPlaylists = $tier === 'pro' ? 10 : ($tier === 'premium' ? 3 : 1);
        $maxDevices = $tier === 'pro' ? 5 : ($tier === 'premium' ? 2 : 1);

        $sub = Subscription::updateOrCreate(
            ['user_id' => $user->id],
            [
                'tier' => $tier,
                'max_playlists' => $maxPlaylists,
                'max_devices' => $maxDevices,
                'expires_at' => $tier === 'free' ? null : now()->addMonth(),
            ]
        );

        return response()->json([
            'message' => "Abonelik paketiniz başarıyla {$tier} seviyesine yükseltildi.",
            'subscription' => $sub,
        ]);
    }
}
