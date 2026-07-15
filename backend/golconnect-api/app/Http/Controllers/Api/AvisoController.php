<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AvisoBusqueda;
use Illuminate\Http\Request;

class AvisoController extends Controller
{
    // GET /api/avisos
    public function index(Request $request)
    {
        $avisos = AvisoBusqueda::with('reclutador.user')
            ->where('estado', 'activo')
            ->when($request->filled('posicion'), fn($q) =>
                $q->where('posicion_requerida', 'like', '%' . $request->posicion . '%'))
            ->when($request->filled('lugar'), fn($q) =>
                $q->where('lugar', 'like', '%' . $request->lugar . '%'))
            ->latest()
            ->paginate(15);

        return response()->json($avisos);
    }

    // POST /api/avisos
    public function store(Request $request)
    {
        $perfilReclutador = $request->user()->perfilReclutador;

        if (! $perfilReclutador) {
            return response()->json([
                'message' => 'Tu perfil de reclutador no está configurado. Completá tu perfil primero.',
            ], 422);
        }

        $data = $request->validate([
            'deporte'             => 'nullable|string',
            'nombre'              => 'required|string|max:150',
            'posicion_requerida'  => 'required|string|max:100',
            'descripcion'         => 'nullable|string',
            'estatura_minima_cm'  => 'nullable|integer',
            'edad_minima'         => 'nullable|integer|min:10|max:60',
            'edad_maxima'         => 'nullable|integer|min:10|max:60',
            'fecha_inicio'        => 'nullable|date',
            'lugar'               => 'nullable|string',
            'habilidades_clave'   => 'nullable|string',
            'requisitos_ingreso'  => 'nullable|string',
        ]);

        $aviso = AvisoBusqueda::create(array_merge($data, [
            'perfil_reclutador_id' => $perfilReclutador->id,
            'deporte'              => $data['deporte'] ?? 'Fútbol Masculino',
        ]));

        return response()->json($aviso->load('reclutador.user'), 201);
    }

    // GET /api/avisos/{aviso}
    public function show(AvisoBusqueda $aviso)
    {
        return response()->json($aviso->load('reclutador.user', 'postulaciones'));
    }

    // PUT /api/avisos/{aviso}
    public function update(Request $request, AvisoBusqueda $aviso)
    {
        $this->autorizarReclutador($request, $aviso);

        $data = $request->validate([
            'nombre'             => 'sometimes|string|max:150',
            'posicion_requerida' => 'sometimes|string|max:100',
            'descripcion'        => 'nullable|string',
            'estatura_minima_cm' => 'nullable|integer',
            'edad_minima'        => 'nullable|integer',
            'edad_maxima'        => 'nullable|integer',
            'fecha_inicio'       => 'nullable|date',
            'lugar'              => 'nullable|string',
            'habilidades_clave'  => 'nullable|string',
            'requisitos_ingreso' => 'nullable|string',
            'estado'             => 'nullable|in:activo,pausado,finalizado',
        ]);

        $aviso->update($data);
        return response()->json($aviso);
    }

    // DELETE /api/avisos/{aviso}
    public function destroy(Request $request, AvisoBusqueda $aviso)
    {
        $this->autorizarReclutador($request, $aviso);
        $aviso->delete();
        return response()->json(['message' => 'Aviso eliminado.']);
    }

    // GET /api/avisos/{aviso}/candidatos
    public function candidatos(Request $request, AvisoBusqueda $aviso)
    {
        $this->autorizarReclutador($request, $aviso);

        $candidatos = $aviso->postulaciones()
            ->with('jugador.user')
            ->get();

        return response()->json($candidatos);
    }

    private function autorizarReclutador(Request $request, AvisoBusqueda $aviso)
    {
        $perfilId = $request->user()->perfilReclutador?->id;
        abort_if(! $perfilId || $aviso->perfil_reclutador_id !== $perfilId, 403, 'No autorizado.');
    }
}
