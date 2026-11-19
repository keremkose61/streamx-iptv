<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\UserDevice;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        $devices = UserDevice::latest('last_active_at')->get();

        return response()->json([
            'devices' => $devices,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $device = UserDevice::findOrFail($id);
        $device->delete();

        return response()->json([
            'message' => 'Cihaz yetkisi başarıyla kaldırıldı.',
        ]);
    }
}
