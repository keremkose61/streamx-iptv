<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayInterface;
use App\Models\User;
use Illuminate\Support\Str;

class MockPaymentGateway implements PaymentGatewayInterface
{
    public function createCheckoutSession(User $user, string $tier, array $options = []): array
    {
        $sessionId = 'sess_mock_' . Str::random(24);

        return [
            'checkout_url' => url("/api/v1/subscriptions/checkout-success?session_id={$sessionId}&tier={$tier}"),
            'session_id' => $sessionId,
            'provider' => 'mock_gateway',
            'tier' => $tier,
            'amount' => $tier === 'pro' ? 149.00 : 79.00,
            'currency' => 'TRY',
        ];
    }

    public function handleWebhook(array $payload, array $headers = []): array
    {
        return [
            'event' => 'checkout.session.completed',
            'user_id' => (int)($payload['user_id'] ?? 0),
            'tier' => $payload['tier'] ?? 'premium',
            'status' => 'paid',
        ];
    }
}
