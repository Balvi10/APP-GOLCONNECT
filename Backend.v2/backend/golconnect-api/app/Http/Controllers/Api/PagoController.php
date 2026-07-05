<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pago;
use Illuminate\Http\Request;

class PagoController extends Controller
{
    // POST /api/pagos — el jugador inicia el proceso de pago
    public function iniciarPago(Request $request)
    {
        $user = $request->user();

        $pago = Pago::create([
            'user_id' => $user->id,
            'plan'    => 'pro_mensual',
            'monto'   => 19.99,
            'moneda'  => 'USD',
            'estado'  => 'pendiente',
        ]);

        // Marcamos el perfil como pendiente de activación
        $user->perfilJugador?->update(['pro_pendiente' => true]);

        return response()->json([
            'pago_id' => $pago->id,
            'mensaje' => 'Pago registrado. Enviá el comprobante por WhatsApp para activar tu plan PRO.',
            'alias'   => 'GOLCONNECT.PRO.MP',
            'cbu'     => '0000003100012345678901',
            'titular' => 'GolConnect Argentina S.A.',
            'whatsapp'=> '+5493624003464',
        ]);
    }

    // GET /api/pagos/estado — consulta el estado del pago pendiente
    public function estadoPago(Request $request)
    {
        $pago = Pago::where('user_id', $request->user()->id)
                    ->latest()
                    ->first();

        if (! $pago) {
            return response()->json(['estado' => 'sin_pago']);
        }

        return response()->json([
            'estado'       => $pago->estado,
            'pro_pendiente'=> $request->user()->perfilJugador?->pro_pendiente,
            'pro_expira_en'=> $request->user()->perfilJugador?->pro_expira_en,
        ]);
    }

    // POST /api/admin/pagos/{pago}/confirmar  (solo admin)
    public function confirmar(Pago $pago)
    {
        $pago->confirmar(); // método del modelo que activa el PRO y crea la notificación
        return response()->json(['mensaje' => 'Pago confirmado y plan PRO activado.']);
    }

    // POST /api/admin/pagos/{pago}/rechazar  (solo admin)
    public function rechazar(Request $request, Pago $pago)
    {
        $pago->update([
            'estado'       => 'rechazado',
            'notas_admin'  => $request->input('motivo'),
        ]);
        $pago->user->perfilJugador?->update(['pro_pendiente' => false]);
        return response()->json(['mensaje' => 'Pago rechazado.']);
    }
}
