<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Postulacion extends Model
{
    use HasFactory;

    // Le indicamos a Laravel el nombre exacto de la tabla en español
    protected $table = 'postulaciones';

    protected $fillable = [
        'aviso_id',
        'perfil_jugador_id',
        'estado',
        'fecha_prueba',
        'notas_reclutador',
        'preseleccionado',
    ];

    protected $casts = [
        'fecha_prueba'   => 'date',
        'preseleccionado' => 'boolean',
    ];

    public function aviso()
    {
        return $this->belongsTo(AvisoBusqueda::class, 'aviso_id');
    }

    public function jugador()
    {
        return $this->belongsTo(PerfilJugador::class, 'perfil_jugador_id');
    }
}