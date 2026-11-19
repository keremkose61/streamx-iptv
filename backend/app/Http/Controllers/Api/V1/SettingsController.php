<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    public function show(Request $request)
    {
        $settings = UserSetting::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'theme' => 'dark',
                'language' => 'tr',
                'preferred_player' => 'auto',
                'buffer_length_seconds' => 30,
            ]
        );

        return response()->json([
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'preferred_player' => ['nullable', 'string', 'in:auto,hlsjs,dashjs,native'],
            'buffer_length_seconds' => ['nullable', 'integer', 'min:5', 'max:120'],
            'theme' => ['nullable', 'string', 'in:dark,light'],
            'language' => ['nullable', 'string', 'in:tr,en'],
            'parental_control_enabled' => ['nullable', 'boolean'],
            'parental_pin' => ['nullable', 'string', 'digits:4'],
        ]);

        $user = $request->user();
        $settings = UserSetting::firstOrCreate(['user_id' => $user->id]);

        $data = $request->only([
            'preferred_player',
            'buffer_length_seconds',
            'theme',
            'language',
            'parental_control_enabled',
        ]);

        if ($request->filled('parental_pin')) {
            $data['parental_pin_hash'] = Hash::make($request->parental_pin);
        }

        $settings->update($data);

        return response()->json([
            'message' => 'Ayarlar başarıyla güncellendi.',
            'settings' => $settings->fresh(),
        ]);
    }

    public function verifyPin(Request $request)
    {
        $request->validate([
            'pin' => ['required', 'string', 'digits:4'],
        ]);

        $settings = UserSetting::where('user_id', $request->user()->id)->first();

        if (!$settings || !$settings->parental_pin_hash) {
            return response()->json(['verified' => true]);
        }

        $isValid = Hash::check($request->pin, $settings->parental_pin_hash);

        return response()->json([
            'verified' => $isValid,
            'message' => $isValid ? 'PIN doğrulandı.' : 'Hatalı PIN kodu.',
        ], $isValid ? 200 : 403);
    }
}
