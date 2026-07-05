<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'nombre',
        'apellido',
        'email',
        'password',
        'rol',
        'whatsapp',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    // ── Relaciones ──────────────────────────────────────────

    public function perfilJugador()
    {
        return $this->hasOne(PerfilJugador::class);
    }

    public function perfilReclutador()
    {
        return $this->hasOne(PerfilReclutador::class);
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class);
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class);
    }

    // ── Helpers ─────────────────────────────────────────────

    public function esJugador(): bool
    {
        return $this->rol === 'jugador';
    }

    public function esReclutador(): bool
    {
        return $this->rol === 'reclutador';
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->nombre} {$this->apellido}";
    }

    /**
     * Serializa el usuario para la API con las relaciones en camelCase.
     * Laravel convierte automáticamente las relaciones cargadas a snake_case
     * al serializar (ver HasAttributes::relationsToArray), lo cual rompe la
     * lectura en el frontend (que espera camelCase: perfilJugador, perfilReclutador).
     * Este método corrige eso de forma centralizada.
     */
    public function toApiArray(): array
    {
        $data = $this->toArray();

        if ($this->relationLoaded('perfilJugador')) {
            $perfil = $this->perfilJugador;
            $data['perfilJugador'] = $perfil ? array_merge($perfil->toArray(), [
                'videos'      => $perfil->relationLoaded('videos')
                    ? $perfil->videos->toArray() : [],
                'trayectoria' => $perfil->relationLoaded('trayectoria')
                    ? $perfil->trayectoria->toArray() : [],
            ]) : null;
            unset($data['perfil_jugador']);
        }

        if ($this->relationLoaded('perfilReclutador')) {
            $perfil = $this->perfilReclutador;
            $data['perfilReclutador'] = $perfil ? array_merge($perfil->toArray(), [
                'credenciales' => $perfil->relationLoaded('credenciales')
                    ? $perfil->credenciales->toArray() : [],
            ]) : null;
            unset($data['perfil_reclutador']);
        }

        return $data;
    }
}
