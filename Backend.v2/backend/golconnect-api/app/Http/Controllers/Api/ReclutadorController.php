<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PerfilJugador;
use Illuminate\Http\Request;

class ReclutadorController extends Controller
{
    // GET /api/reclutador/perfil
    public function perfil(Request $request)
    {
        $user = $request->user();
        $user->load('perfilReclutador.credenciales');
        return response()->json($user->toApiArray());
    }

    // PUT /api/reclutador/perfil
    public function actualizarPerfil(Request $request)
    {
        $user   = $request->user();
        $perfil = $user->perfilReclutador;

        $data = $request->validate([
            'nombre'             => 'sometimes|string|max:100',
            'apellido'           => 'sometimes|string|max:100',
            'whatsapp'           => 'nullable|string|max:20',
            'cargo'              => 'nullable|string',
            'institucion'        => 'nullable|string',
            'categoria'          => 'nullable|string',
            'ciudad'             => 'nullable|string',
            'pais'               => 'nullable|string',
            'anios_experiencia'  => 'nullable|integer',
            'fichajes_realizados'=> 'nullable|integer',
        ]);

        if (isset($data['nombre']))   $user->nombre   = $data['nombre'];
        if (isset($data['apellido'])) $user->apellido = $data['apellido'];
        if (isset($data['whatsapp'])) $user->whatsapp = $data['whatsapp'];
        $user->save();

        $perfilData = array_diff_key($data, array_flip(['nombre', 'apellido', 'whatsapp']));
        $perfil->update($perfilData);

        $user->load('perfilReclutador.credenciales');
        return response()->json($user->toApiArray());
    }

    // POST /api/reclutador/perfil/foto
    public function subirFoto(Request $request)
    {
        $request->validate(['foto' => 'required|file|mimes:jpg,jpeg,png,heic,heif|max:8192']);

        try {
            $path = $request->file('foto')->store('fotos_reclutador', 'public');
            $perfil = $request->user()->perfilReclutador;

            if (!$perfil) {
                return response()->json(['message' => 'No se encontró el perfil del reclutador.'], 404);
            }

            $perfil->update(['foto_perfil' => $path]);

            return response()->json(['foto_perfil' => $path]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error al guardar la foto: ' . $e->getMessage(),
            ], 500);
        }
    }

    // GET /api/reclutador/inicio
    public function inicio(Request $request)
    {
        $user   = $request->user();
        $perfil = $user->perfilReclutador;

        // Avisos ÚNICAMENTE del reclutador autenticado (relación perfil->avisos())
        $avisosActivos = $perfil->avisos()
            ->where('estado', 'activo')
            ->with('postulaciones')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($aviso) {
                $aviso->total_postulaciones = $aviso->postulaciones->count();
                $aviso->preseleccionados    = $aviso->postulaciones
                    ->where('preseleccionado', true)
                    ->count();
                unset($aviso->postulaciones); // no hace falta mandar el detalle completo
                return $aviso;
            });

        $totalPostulaciones = $perfil->avisos()
            ->withCount('postulaciones')
            ->get()
            ->sum('postulaciones_count');

        return response()->json([
            'nombre'              => $user->nombre,
            'apellido'            => $user->apellido,
            'institucion'         => $perfil->institucion,
            'verificado'          => $perfil->verificado,
            'total_avisos_activos'=> $avisosActivos->count(),
            'total_postulaciones' => $totalPostulaciones,
            'total_jugadores'     => $perfil->contactosJugadores()->count(),
            'avisos_recientes'    => $avisosActivos,
        ]);
    }

    // GET /api/reclutador/buscar
    public function buscar(Request $request)
    {
        $query = PerfilJugador::with('user')
            ->whereHas('user', fn($q) => $q->whereNull('deleted_at'));

        // Búsqueda general por nombre (nombre o apellido del user)
        if ($request->filled('nombre')) {
            $busq = $request->nombre;
            $query->whereHas('user', function ($q) use ($busq) {
                $q->where('nombre',   'like', "%{$busq}%")
                  ->orWhere('apellido','like', "%{$busq}%");
            });
        }

        // Búsqueda por posición (principal o secundaria)
        if ($request->filled('posicion')) {
            $pos = $request->posicion;
            $query->where(function ($q) use ($pos) {
                $q->where('posicion_principal',  'like', "%{$pos}%")
                  ->orWhere('posicion_secundaria','like', "%{$pos}%");
            });
        }

        // Búsqueda por ciudad
        if ($request->filled('ciudad')) {
            $query->where('ciudad', 'like', '%' . $request->ciudad . '%');
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        if ($request->filled('edad_min')) {
            $query->whereRaw('TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) >= ?', [$request->edad_min]);
        }
        if ($request->filled('edad_max')) {
            $query->whereRaw('TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) <= ?', [$request->edad_max]);
        }
        if ($request->filled('altura_min')) {
            $query->where('altura_cm', '>=', $request->altura_min);
        }

        $jugadores = $query->paginate(20);

        return response()->json($jugadores);
    }

    // GET /api/reclutador/mis-jugadores
    public function misJugadores(Request $request)
    {
        $contactos = $request->user()->perfilReclutador
            ->contactosJugadores()
            ->with('jugador.user')
            ->latest()
            ->get();

        return response()->json($contactos);
    }
}
