<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VideoJugador;
use App\Models\TrayectoriaJugador;
use Illuminate\Http\Request;

class JugadorController extends Controller
{
    // GET /api/jugador/perfil
    public function perfil(Request $request)
    {
        $user = $request->user();
        $user->load('perfilJugador.videos', 'perfilJugador.trayectoria');
        return response()->json($user->toApiArray());
    }

    // PUT /api/jugador/perfil
    public function actualizarPerfil(Request $request)
    {
        $user   = $request->user();
        $perfil = $user->perfilJugador;

        $data = $request->validate([
            'nombre'               => 'sometimes|string|max:100',
            'apellido'             => 'sometimes|string|max:100',
            'whatsapp'             => 'nullable|string|max:20',
            'ciudad'               => 'nullable|string',
            'pais'                 => 'nullable|string',
            'altura_cm'            => 'nullable|integer',
            'peso_kg'              => 'nullable|integer',
            'pierna_habil'         => 'nullable|in:zurdo,diestro,ambidiestro',
            'posicion_principal'   => 'nullable|string',
            'posicion_secundaria'  => 'nullable|string',
            'estado'               => 'nullable|in:libre,amateur,profesional',
            'club_actual'          => 'nullable|string',
            'liga_actual'          => 'nullable|string',
            'division_actual'      => 'nullable|string',
            'temporada_partidos'   => 'nullable|integer',
            'temporada_goles'      => 'nullable|integer',
            'temporada_asistencias'=> 'nullable|integer',
        ]);

        if (isset($data['nombre']))   $user->nombre   = $data['nombre'];
        if (isset($data['apellido'])) $user->apellido = $data['apellido'];
        if (isset($data['whatsapp'])) $user->whatsapp = $data['whatsapp'];
        $user->save();

        $perfilData = array_diff_key($data, array_flip(['nombre', 'apellido', 'whatsapp']));
        $perfil->update($perfilData);

        $user->load('perfilJugador.videos', 'perfilJugador.trayectoria');
        return response()->json($user->toApiArray());
    }

    // POST /api/jugador/perfil/foto
    public function subirFoto(Request $request)
    {
        $request->validate(['foto' => 'required|file|mimes:jpg,jpeg,png,heic,heif|max:8192']);

        try {
            $path = $request->file('foto')->store('fotos_perfil', 'public');
            $perfil = $request->user()->perfilJugador;

            if (!$perfil) {
                return response()->json(['message' => 'No se encontró el perfil del jugador.'], 404);
            }

            $perfil->update(['foto_perfil' => $path]);

            return response()->json(['foto_perfil' => $path]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error al guardar la foto: ' . $e->getMessage(),
            ], 500);
        }
    }

    // GET /api/jugador/inicio
    public function inicio(Request $request)
    {
        $user   = $request->user();
        $perfil = $user->perfilJugador;

        return response()->json([
            'nombre'             => $user->nombre,
            'apellido'           => $user->apellido,
            'foto_perfil'        => $perfil->foto_perfil,
            'plan'               => $perfil->plan ?? 'amateur',
            'pro_expira_en'      => $perfil->pro_expira_en,
            'visitas_perfil'     => $perfil->visitas_perfil ?? 0,
            'clubes_interesados' => $perfil->clubes_interesados ?? 0,
            'scouts_activos'     => $perfil->scouts_activos ?? 0,
            'temporada_partidos'     => $perfil->temporada_partidos ?? 0,
            'temporada_goles'        => $perfil->temporada_goles ?? 0,
            'temporada_asistencias'  => $perfil->temporada_asistencias ?? 0,
        ]);
    }

    // GET /api/jugador/videos
    public function videos(Request $request)
    {
        $videos = $request->user()->perfilJugador->videos()->orderBy('orden')->get();
        return response()->json($videos);
    }

    // POST /api/jugador/videos
    public function agregarVideo(Request $request)
    {
        $data = $request->validate([
            'titulo'       => 'nullable|string|max:100',
            'url'          => 'required|string|max:500',
            'thumbnail'    => 'nullable|string|max:500',
            'es_highlight' => 'boolean',
        ]);

        $perfilId = $request->user()->perfilJugador->id;
        $orden    = VideoJugador::where('perfil_jugador_id', $perfilId)->max('orden') + 1;

        $video = VideoJugador::create(array_merge($data, [
            'perfil_jugador_id' => $perfilId,
            'orden'             => $orden,
        ]));

        return response()->json($video, 201);
    }

    // DELETE /api/jugador/videos/{id}
    public function eliminarVideo(Request $request, $id)
    {
        $perfilId = $request->user()->perfilJugador?->id;

        if (!$perfilId) {
            return response()->json(['message' => 'Perfil no encontrado.'], 404);
        }

        $video = VideoJugador::where('id', $id)
            ->where('perfil_jugador_id', $perfilId)
            ->first();

        if (!$video) {
            // Devolver 200 igualmente para no romper el frontend si ya fue eliminado
            return response()->json(['message' => 'Video no encontrado o ya eliminado.']);
        }

        $video->delete();
        return response()->json(['message' => 'Video eliminado.']);
    }

    // GET /api/jugador/trayectoria
    public function trayectoria(Request $request)
    {
        return response()->json($request->user()->perfilJugador->trayectoria);
    }

    // POST /api/jugador/trayectoria
    public function agregarTrayectoria(Request $request)
    {
        $data = $request->validate([
            'club'             => 'required|string|max:100',
            'division'         => 'nullable|string|max:100',
            'categoria'        => 'nullable|string|max:100',
            'partidos'         => 'nullable|integer',
            'temporada_inicio' => 'nullable|integer|min:1900|max:2100',
            'temporada_fin'    => 'nullable|integer|min:1900|max:2100',
        ]);

        $perfilId = $request->user()->perfilJugador->id;
        $orden    = TrayectoriaJugador::where('perfil_jugador_id', $perfilId)->max('orden') + 1;

        $item = TrayectoriaJugador::create(array_merge($data, [
            'perfil_jugador_id' => $perfilId,
            'orden'             => $orden,
        ]));

        return response()->json($item, 201);
    }
}
