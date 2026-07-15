<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\{
    User, PerfilJugador, PerfilReclutador,
    VideoJugador, TrayectoriaJugador,
    CredencialReclutador, AvisoBusqueda,
    Postulacion, ContactoJugador,
    Pago, Notificacion, BusquedaFavorita
};

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. JUGADORES ────────────────────────────────────────────────────

        $userJugador = User::create([
            'nombre'   => 'Alex',
            'apellido' => 'Morgan',
            'email'    => 'alex@jugador.com',
            'password' => Hash::make('password'),
            'rol'      => 'jugador',
            'whatsapp' => '+5491112345678',
        ]);

        $perfilJugador = PerfilJugador::create([
            'user_id'              => $userJugador->id,
            'fecha_nacimiento'     => '2002-03-15',
            'ciudad'               => 'Buenos Aires',
            'pais'                 => 'Argentina',
            'altura_cm'            => 182,
            'peso_kg'              => 78,
            'pierna_habil'         => 'diestro',
            'posicion_principal'   => 'Delantero Centro',
            'posicion_secundaria'  => 'Extremo Derecho',
            'estado'               => 'profesional',
            'club_actual'          => 'FC Metropolis',
            'liga_actual'          => 'Liga Profesional',
            'division_actual'      => 'Primera División',
            'plan'                 => 'pro',
            'pro_activado_en'      => now(),
            'pro_expira_en'        => now()->addDays(30),
            'visitas_perfil'       => 850,
            'clubes_interesados'   => 12,
            'scouts_activos'       => 45,
            'temporada_partidos'   => 24,
            'temporada_goles'      => 18,
            'temporada_asistencias'=> 7,
        ]);

        VideoJugador::create([
            'perfil_jugador_id' => $perfilJugador->id,
            'titulo'            => 'GOLES 2024',
            'url'               => 'https://youtube.com/watch?v=ejemplo',
            'es_highlight'      => true,
            'orden'             => 1,
        ]);

        TrayectoriaJugador::create([
            'perfil_jugador_id' => $perfilJugador->id,
            'club'              => 'CA Huracán',
            'division'          => 'Primera División',
            'partidos'          => 28,
            'temporada_inicio'  => 2022,
            'temporada_fin'     => 2023,
            'orden'             => 1,
        ]);
        TrayectoriaJugador::create([
            'perfil_jugador_id' => $perfilJugador->id,
            'club'              => 'San Lorenzo Youth',
            'division'          => 'Reserva',
            'partidos'          => 42,
            'temporada_inicio'  => 2020,
            'temporada_fin'     => 2022,
            'orden'             => 2,
        ]);

        // ── 2. RECLUTADOR ───────────────────────────────────────────────────

        $userReclutador = User::create([
            'nombre'   => 'Alejandro',
            'apellido' => 'Martí',
            'email'    => 'a.marti@atletico.es',
            'password' => Hash::make('password'),
            'rol'      => 'reclutador',
        ]);

        $perfilReclutador = PerfilReclutador::create([
            'user_id'             => $userReclutador->id,
            'cargo'               => 'Reclutador Senior',
            'institucion'         => 'Atlético Madrid',
            'categoria'           => 'Primera División',
            'ciudad'              => 'Madrid',
            'pais'                => 'España',
            'anios_experiencia'   => 10,
            'fichajes_realizados' => 150,
            'verificado'          => true,
            'verificado_en'       => now(),
        ]);

        CredencialReclutador::create([
            'perfil_reclutador_id' => $perfilReclutador->id,
            'titulo'               => 'Licencia UEFA Pro',
            'identificador'        => 'UEFA-2024-AM',
            'estado'               => 'verificada',
            'expira'               => 2026,
        ]);

        BusquedaFavorita::create([
            'perfil_reclutador_id' => $perfilReclutador->id,
            'etiqueta'             => 'Extremos Sub-19 · Latam',
            'filtros'              => ['posicion' => 'Extremo', 'edad_max' => 19, 'region' => 'Latam'],
        ]);
        BusquedaFavorita::create([
            'perfil_reclutador_id' => $perfilReclutador->id,
            'etiqueta'             => 'MCD Box-to-Box · Europa',
            'filtros'              => ['posicion' => 'Mediocentro', 'region' => 'Europa'],
        ]);

        // ── 3. AVISO DE BÚSQUEDA ────────────────────────────────────────────

        $aviso = AvisoBusqueda::create([
            'perfil_reclutador_id' => $perfilReclutador->id,
            'deporte'              => 'Fútbol Masculino',
            'nombre'               => 'DELANTERO ELITE - SUDAMÉRICA',
            'posicion_requerida'   => 'Delantero Centro',
            'descripcion'          => 'Finalizador de alta intensidad y flexibilidad táctica. Mínimo 2 temporadas en academia.',
            'estatura_minima_cm'   => 178,
            'edad_minima'          => 18,
            'edad_maxima'          => 25,
            'fecha_inicio'         => now()->addDays(15),
            'lugar'                => 'Estadio Metropolitano, Madrid',
            'habilidades_clave'    => 'Definición, juego aéreo, velocidad',
            'requisitos_ingreso'   => 'Documento, ficha médica vigente',
            'estado'               => 'activo',
            'total_postulaciones'  => 342,
            'preseleccionados'     => 12,
        ]);

        // ── 4. POSTULACIÓN ──────────────────────────────────────────────────

        Postulacion::create([
            'aviso_id'          => $aviso->id,
            'perfil_jugador_id' => $perfilJugador->id,
            'estado'            => 'confirmada',
            'fecha_prueba'      => now()->addDays(15)->toDateString(),
        ]);

        // ── 5. CONTACTO ─────────────────────────────────────────────────────

        ContactoJugador::create([
            'perfil_reclutador_id' => $perfilReclutador->id,
            'perfil_jugador_id'    => $perfilJugador->id,
            'tipo'                 => 'prueba',
            'canal'                => 'email',
            'estado'               => 'en_revision',
        ]);

        // ── 6. PAGO ─────────────────────────────────────────────────────────

        Pago::create([
            'user_id'        => $userJugador->id,
            'plan'           => 'pro_mensual',
            'monto'          => 19.99,
            'moneda'         => 'USD',
            'estado'         => 'confirmado',
            'confirmado_en'  => now(),
            'expira_en'      => now()->addDays(30),
        ]);

        // ── 7. NOTIFICACIÓN ─────────────────────────────────────────────────

        Notificacion::create([
            'user_id' => $userJugador->id,
            'tipo'    => 'pro_activado',
            'titulo'  => '¡Tu perfil PRO está activo!',
            'cuerpo'  => 'Ya podés aparecer en el radar de los mejores scouts del mundo.',
        ]);

        Notificacion::create([
            'user_id' => $userJugador->id,
            'tipo'    => 'scout_vio_perfil',
            'titulo'  => 'Un scout vio tu perfil',
            'cuerpo'  => 'Un reclutador de Atlético Madrid revisó tu perfil hace 2 horas.',
        ]);
    }
}
