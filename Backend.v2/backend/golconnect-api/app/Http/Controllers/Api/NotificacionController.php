<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    // GET /api/notificaciones
    public function index(Request $request)
    {
        $notificaciones = Notificacion::where('user_id', $request->user()->id)
            ->latest()
            ->take(50)
            ->get();

        $noLeidas = $notificaciones->whereNull('leida_en')->count();

        return response()->json([
            'notificaciones' => $notificaciones,
            'no_leidas'      => $noLeidas,
        ]);
    }

    // POST /api/notificaciones/{id}/leer
    public function marcarLeida(Request $request, $id)
    {
        $notif = Notificacion::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notif->update(['leida_en' => now()]);

        return response()->json(['message' => 'Marcada como leída.']);
    }
}
