<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PerfilJugador extends Model
{
    use HasFactory;

    protected $table = 'perfiles_jugador';

    protected $fillable = [
        'user_id',
        'fecha_nacimiento',
        'ciudad',
        'pais',
        'foto_perfil',
        'altura_cm',
        'peso_kg',
        'pierna_habil',
        'posicion_principal',
        'posicion_secundaria',
        'estado',
        'club_actual',
        'liga_actual',
        'division_actual',
        'plan',
        'pro_activado_en',
        'pro_expira_en',
        'pro_pendiente',
        'visitas_perfil',
        'clubes_interesados',
        'scouts_activos',
        'temporada_partidos',
        'temporada_goles',
        'temporada_asistencias',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'pro_activado_en'  => 'datetime',
        'pro_expira_en'    => 'datetime',
        'pro_pendiente'    => 'boolean',
    ];

    // ── Relaciones ──────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function videos()
    {
        return $this->hasMany(VideoJugador::class)->orderBy('orden');
    }

    public function trayectoria()
    {
        return $this->hasMany(TrayectoriaJugador::class)->orderBy('orden');
    }

    public function postulaciones()
    {
        return $this->hasMany(Postulacion::class);
    }

    public function contactosReclutador()
    {
        return $this->hasMany(ContactoJugador::class);
    }

    // ── Helpers ─────────────────────────────────────────────

    public function esPro(): bool
    {
        return $this->plan === 'pro'
            && $this->pro_expira_en
            && $this->pro_expira_en->isFuture();
    }

    public function getEdadAttribute(): ?int
    {
        return $this->fecha_nacimiento?->age;
    }
}
