<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{User, PerfilJugador, PerfilReclutador, VideoJugador};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // POST /api/auth/register/jugador
    public function registerJugador(Request $request)
    {
        $data = $request->validate([
            'nombre'              => 'required|string|max:100',
            'apellido'            => 'required|string|max:100',
            'email'               => 'required|email|unique:users',
            'password'            => 'required|string|min:8',
            'fecha_nacimiento'    => 'required|date',
            'ciudad'              => 'nullable|string',
            'altura_cm'           => 'nullable|integer',
            'peso_kg'             => 'nullable|integer',
            'pierna_habil'        => 'nullable|in:zurdo,diestro,ambidiestro',
            'posicion_principal'  => 'nullable|string',
            'posicion_secundaria' => 'nullable|string',
            'estado'              => 'nullable|in:libre,amateur,profesional',
            'club_actual'         => 'nullable|string',
            'liga_actual'         => 'nullable|string',
            'division_actual'     => 'nullable|string',
            'video_url'           => 'nullable|string|max:500',
        ]);

        $user = User::create([
            'nombre'   => $data['nombre'],
            'apellido' => $data['apellido'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'rol'      => 'jugador',
        ]);

        $perfil = PerfilJugador::create([
            'user_id'             => $user->id,
            'fecha_nacimiento'    => $data['fecha_nacimiento'],
            'ciudad'              => $data['ciudad'] ?? null,
            'altura_cm'           => $data['altura_cm'] ?? null,
            'peso_kg'             => $data['peso_kg'] ?? null,
            'pierna_habil'        => $data['pierna_habil'] ?? 'diestro',
            'posicion_principal'  => $data['posicion_principal'] ?? null,
            'posicion_secundaria' => $data['posicion_secundaria'] ?? null,
            'estado'              => $data['estado'] ?? 'libre',
            'club_actual'         => $data['club_actual'] ?? null,
            'liga_actual'         => $data['liga_actual'] ?? null,
            'division_actual'     => $data['division_actual'] ?? null,
        ]);

        if (!empty($data['video_url'])) {
            VideoJugador::create([
                'perfil_jugador_id' => $perfil->id,
                'url'               => $data['video_url'],
                'titulo'            => 'Highlights',
                'es_highlight'      => true,
                'orden'             => 1,
            ]);
        }

        $token = $user->createToken('app')->plainTextToken;
        $user->load('perfilJugador.videos', 'perfilJugador.trayectoria');

        return response()->json([
            'token' => $token,
            'user'  => $user->toApiArray(),
        ], 201);
    }

    // POST /api/auth/register/reclutador
    public function registerReclutador(Request $request)
    {
        $data = $request->validate([
            'nombre'      => 'required|string|max:100',
            'apellido'    => 'required|string|max:100',
            'email'       => 'required|email|unique:users',
            'password'    => 'required|string|min:8',
            'cargo'       => 'nullable|string',
            'institucion' => 'nullable|string',
            'categoria'   => 'nullable|string',
            'ciudad'      => 'nullable|string',
            'pais'        => 'nullable|string',
            'credencial'  => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $user = User::create([
            'nombre'   => $data['nombre'],
            'apellido' => $data['apellido'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'rol'      => 'reclutador',
        ]);

        $credencialPath = null;
        if ($request->hasFile('credencial')) {
            $credencialPath = $request->file('credencial')->store('credenciales', 'private');
        }

        PerfilReclutador::create([
            'user_id'        => $user->id,
            'cargo'          => $data['cargo'] ?? null,
            'institucion'    => $data['institucion'] ?? null,
            'categoria'      => $data['categoria'] ?? null,
            'ciudad'         => $data['ciudad'] ?? null,
            'pais'           => $data['pais'] ?? null,
            'credencial_path'=> $credencialPath,
        ]);

        $token = $user->createToken('app')->plainTextToken;
        $user->load('perfilReclutador.credenciales');

        return response()->json([
            'token' => $token,
            'user'  => $user->toApiArray(),
        ], 201);
    }

    // POST /api/auth/login
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
            'rol'      => 'required|in:jugador,reclutador',
        ]);

        $user = User::where('email', $data['email'])->where('rol', $data['rol'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales incorrectas.'],
            ]);
        }

        $token = $user->createToken('app')->plainTextToken;

        if ($user->esJugador()) {
            $user->load('perfilJugador.videos', 'perfilJugador.trayectoria');
        } else {
            $user->load('perfilReclutador.credenciales');
        }

        return response()->json(['token' => $token, 'user' => $user->toApiArray()]);
    }

    // POST /api/auth/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada.']);
    }

    // GET /api/auth/me
    public function me(Request $request)
    {
        $user = $request->user();
        if ($user->esJugador()) {
            $user->load('perfilJugador.videos', 'perfilJugador.trayectoria');
        } else {
            $user->load('perfilReclutador.credenciales');
        }
        return response()->json($user->toApiArray());
    }
}
