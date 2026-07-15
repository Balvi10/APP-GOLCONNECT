<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactoJugador;
use App\Models\PerfilJugador;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class ContactoController extends Controller
{
    // POST /api/jugadores/{jugadorId}/contactar
    public function contactar(Request $request, $jugadorId)
    {
        $perfilReclutador = $request->user()->perfilReclutador;
        abort_if(! $perfilReclutador, 403, 'Solo los reclutadores pueden contactar jugadores.');

        $perfilJugador = PerfilJugador::findOrFail($jugadorId);

        $data = $request->validate([
            'tipo'          => 'required|in:interes,prueba,reunion',
            'canal'         => 'required|in:email,whatsapp',
            'notas'         => 'nullable|string',
            'fecha_reunion' => 'nullable|date',
        ]);

        $contacto = ContactoJugador::create([
            'perfil_reclutador_id' => $perfilReclutador->id,
            'perfil_jugador_id'    => $perfilJugador->id,
            'tipo'                 => $data['tipo'],
            'canal'                => $data['canal'],
            'notas'                => $data['notas'] ?? null,
            'fecha_reunion'        => $data['fecha_reunion'] ?? null,
            'estado'               => 'mensaje_enviado',
        ]);

        // Notificar al jugador
        try {
            Notificacion::create([
                'user_id' => $perfilJugador->user->id,
                'tipo'    => 'scout_contacto',
                'titulo'  => 'Un club se contactó con vos',
                'cuerpo'  => "{$perfilReclutador->user->nombre} de {$perfilReclutador->institucion} está interesado en tu perfil.",
                'data'    => ['contacto_id' => $contacto->id],
            ]);
        } catch (\Exception $e) { /* no romper si falla notificación */ }

        return response()->json($contacto, 201);
    }

    // GET /api/jugadores/{jugadorId} — detalle público (incluye whatsapp y email del user)
    public function detalle(Request $request, $jugadorId)
    {
        abort_if(! $request->user()->esReclutador(), 403, 'Solo reclutadores pueden ver este detalle.');

        $perfil = PerfilJugador::with('user', 'videos', 'trayectoria')
            ->findOrFail($jugadorId);

        $perfil->increment('visitas_perfil');

        // Incluir datos de contacto del usuario en la respuesta
        $data = $perfil->toArray();
        $data['nombre']   = $perfil->user->nombre;
        $data['apellido'] = $perfil->user->apellido;
        $data['email']    = $perfil->user->email;
        $data['whatsapp'] = $perfil->user->whatsapp ?? null;

        return response()->json($data);
    }
}
