<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    AuthController,
    JugadorController,
    ReclutadorController,
    AvisoController,
    PostulacionController,
    ContactoController,
    PagoController,
    NotificacionController,
    MediaController,
};

/*
|--------------------------------------------------------------------------
| API Routes — GolConnect
|--------------------------------------------------------------------------
*/

// ── Auth (públicas) ────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register/jugador',    [AuthController::class, 'registerJugador']);
    Route::post('register/reclutador', [AuthController::class, 'registerReclutador']);
    Route::post('login',               [AuthController::class, 'login']);
});

// ── Media (pública) ─────────────────────────────────────────────────────────
// Sirve fotos de perfil directamente vía Laravel, sin depender del symlink
// de storage:link (que puede fallar en el servidor embebido de PHP en Windows).
Route::get('media/{path}', [MediaController::class, 'foto'])
    ->where('path', '.*');

// ── Rutas protegidas ───────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [AuthController::class, 'me']);

    // ── Jugador ─────────────────────────────────────────────────────────────
    Route::prefix('jugador')->group(function () {
        Route::get ('perfil',                   [JugadorController::class, 'perfil']);
        Route::put ('perfil',                   [JugadorController::class, 'actualizarPerfil']);
        Route::post('perfil/foto',              [JugadorController::class, 'subirFoto']);
        Route::get ('inicio',                   [JugadorController::class, 'inicio']);        // stats + plan

        // Videos
        Route::get   ('videos',       [JugadorController::class, 'videos']);
        Route::post  ('videos',       [JugadorController::class, 'agregarVideo']);
        Route::delete('videos/{id}',  [JugadorController::class, 'eliminarVideo']);

        // Trayectoria
        Route::get ('trayectoria',  [JugadorController::class, 'trayectoria']);
        Route::post('trayectoria',  [JugadorController::class, 'agregarTrayectoria']);
    });

    // ── Reclutador ──────────────────────────────────────────────────────────
    Route::prefix('reclutador')->group(function () {
        Route::get ('perfil',            [ReclutadorController::class, 'perfil']);
        Route::put ('perfil',            [ReclutadorController::class, 'actualizarPerfil']);
        Route::post('perfil/foto',       [ReclutadorController::class, 'subirFoto']);
        Route::get ('inicio',            [ReclutadorController::class, 'inicio']);
        Route::get ('buscar',            [ReclutadorController::class, 'buscar']);
        Route::get ('mis-jugadores',     [ReclutadorController::class, 'misJugadores']);
    });

    // ── Avisos de búsqueda ──────────────────────────────────────────────────
    Route::apiResource('avisos', AvisoController::class);
    Route::get('avisos/{aviso}/candidatos', [AvisoController::class, 'candidatos']);

    // ── Postulaciones ───────────────────────────────────────────────────────
    Route::get ('postulaciones',               [PostulacionController::class, 'misPostulaciones']);
    Route::post('avisos/{aviso}/postular',     [PostulacionController::class, 'postular']);
    Route::put ('postulaciones/{id}/estado',   [PostulacionController::class, 'cambiarEstado']);

    // ── Contactar jugador ───────────────────────────────────────────────────
    Route::post('jugadores/{jugadorId}/contactar', [ContactoController::class, 'contactar']);
    Route::get ('jugadores/{jugadorId}',            [ContactoController::class, 'detalle']);

    // ── Pagos ───────────────────────────────────────────────────────────────
    Route::post('pagos',                [PagoController::class, 'iniciarPago']);
    Route::get ('pagos/estado',         [PagoController::class, 'estadoPago']);

    // ── Notificaciones ──────────────────────────────────────────────────────
    Route::get ('notificaciones',           [NotificacionController::class, 'index']);
    Route::post('notificaciones/{id}/leer', [NotificacionController::class, 'marcarLeida']);

    // ── ADMIN (confirmar pagos manualmente) ─────────────────────────────────
    Route::middleware('admin')->group(function () {
        Route::post('admin/pagos/{pago}/confirmar', [PagoController::class, 'confirmar']);
        Route::post('admin/pagos/{pago}/rechazar',  [PagoController::class, 'rechazar']);
    });
});
