<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AvisoBusqueda;
use App\Models\Postulacion;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class PostulacionController extends Controller
{
    // GET /api/postulaciones  — mis postulaciones como jugador
    public function misPostulaciones(Request $request)
    {
        $perfilId = $request->user()->perfilJugador?->id;

        $postulaciones = Postulacion::with('aviso.reclutador.user')
            ->where('perfil_jugador_id', $perfilId)
            ->latest()
            ->get();

        return response()->json($postulaciones);
    }

    // POST /api/avisos/{aviso}/postular
    public function postular(Request $request, AvisoBusqueda $aviso)
    {
        $perfilJugadorId = $request->user()->perfilJugador?->id;
        abort_if(! $perfilJugadorId, 403, 'Solo los jugadores pueden postularse.');
        abort_if($aviso->estado !== 'activo', 422, 'Este aviso ya no está activo.');

        // Evitar duplicados
        $existe = Postulacion::where('aviso_id', $aviso->id)
            ->where('perfil_jugador_id', $perfilJugadorId)
            ->exists();

        abort_if($existe, 422, 'Ya te postulaste a este aviso.');

        $postulacion = Postulacion::create([
            'aviso_id'         => $aviso->id,
            'perfil_jugador_id'=> $perfilJugadorId,
            'estado'           => 'enviada',
        ]);

        // Incrementar contador en el aviso
        $aviso->increment('total_postulaciones');

        // Notificar al reclutador
        $reclutadorUserId = $aviso->reclutador->user->id;
        Notificacion::create([
            'user_id' => $reclutadorUserId,
            'tipo'    => 'nueva_postulacion',
            'titulo'  => 'Nueva postulación recibida',
            'cuerpo'  => "Un jugador se postuló a tu aviso: {$aviso->nombre}",
            'data'    => ['aviso_id' => $aviso->id, 'postulacion_id' => $postulacion->id],
        ]);

        return response()->json($postulacion->load('aviso'), 201);
    }

    // PUT /api/postulaciones/{id}/estado  — el reclutador cambia el estado
    public function cambiarEstado(Request $request, $id)
    {
        $data = $request->validate([
            'estado'        => 'required|in:enviada,en_revision,confirmada,finalizada',
            'fecha_prueba'  => 'nullable|date',
            'notas_reclutador' => 'nullable|string',
            'preseleccionado'  => 'nullable|boolean',
        ]);

        $postulacion = Postulacion::with('aviso')->findOrFail($id);

        // Verificar que el reclutador sea el dueño del aviso
        $perfilReclutadorId = $request->user()->perfilReclutador?->id;
        abort_if($postulacion->aviso->perfil_reclutador_id !== $perfilReclutadorId, 403, 'No autorizado.');

        $postulacion->update($data);

        // Notificar al jugador si fue confirmada
        if ($data['estado'] === 'confirmada') {
            $jugadorUserId = $postulacion->jugador->user->id;
            Notificacion::create([
                'user_id' => $jugadorUserId,
                'tipo'    => 'postulacion_confirmada',
                'titulo'  => '¡Prueba confirmada!',
                'cuerpo'  => "Tu postulación para {$postulacion->aviso->nombre} fue confirmada.",
                'data'    => ['postulacion_id' => $postulacion->id],
            ]);
        }

        return response()->json($postulacion);
    }
}
