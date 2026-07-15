<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    /**
     * Sirve un archivo del disco 'public' directamente a través de Laravel/PHP,
     * en vez de depender del symlink `public/storage` (creado por storage:link).
     *
     * Por qué existe esto: en Windows, el servidor embebido de PHP
     * (el que usa `php artisan serve`) a veces NO resuelve correctamente
     * los symlinks/junctions que crea storage:link, y las peticiones a
     * /storage/... devuelven 404 aunque el archivo exista físicamente en
     * disco. Sirviendo el archivo con código PHP (leyendo el disco
     * directamente) evitamos depender de esa resolución del sistema
     * operativo por completo.
     *
     * GET /api/media/{path} — {path} puede incluir subcarpetas,
     * ej: fotos_perfil/abc123.jpg
     */
    public function foto(Request $request, string $path)
    {
        // Seguridad básica: no permitir salir del directorio con ../
        if (str_contains($path, '..')) {
            abort(404);
        }

        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'Archivo no encontrado.');
        }

        $mime = Storage::disk('public')->mimeType($path) ?? 'application/octet-stream';
        $contenido = Storage::disk('public')->get($path);

        return response($contenido, 200)
            ->header('Content-Type', $mime)
            ->header('Cache-Control', 'public, max-age=86400');
    }
}
