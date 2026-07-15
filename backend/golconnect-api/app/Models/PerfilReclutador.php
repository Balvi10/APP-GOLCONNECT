<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PerfilReclutador extends Model
{
    use HasFactory;

    protected $table = 'perfiles_reclutador';

    protected $fillable = [
        'user_id',
        'cargo',
        'institucion',
        'categoria',
        'ciudad',
        'pais',
        'foto_perfil',
        'anios_experiencia',
        'fichajes_realizados',
        'verificado',
        'credencial_path',
        'verificado_en',
    ];

    protected $casts = [
        'verificado'    => 'boolean',
        'verificado_en' => 'datetime',
    ];

    // ── Relaciones ──────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function credenciales()
    {
        return $this->hasMany(CredencialReclutador::class);
    }

    public function avisos()
    {
        return $this->hasMany(AvisoBusqueda::class);
    }

    public function busquedasFavoritas()
    {
        return $this->hasMany(BusquedaFavorita::class);
    }

    public function contactosJugadores()
    {
        return $this->hasMany(ContactoJugador::class);
    }

    public function redContactos()
    {
        return $this->belongsToMany(
            PerfilReclutador::class,
            'red_reclutadores',
            'reclutador_id',
            'contacto_id'
        );
    }
}
