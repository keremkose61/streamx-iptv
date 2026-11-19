<?php

namespace App\Contracts;

use App\Models\User;

interface PaymentGatewayInterface
{
    /**
     * Create checkout session for a subscription tier.
     *
     * @param User $user
     * @param string $tier ('premium' | 'pro')
     * @param array $options
     * @return array{checkout_url: string, session_id: string}
     */
    public function createCheckoutSession(User $user, string $tier, array $options = []): array;

    /**
     * Handle incoming webhook event.
     *
     * @param array $payload
     * @param array $headers
     * @return array{event: string, user_id: int, tier: string, status: string}
     */
    public function handleWebhook(array $payload, array $headers = []): array;
}
