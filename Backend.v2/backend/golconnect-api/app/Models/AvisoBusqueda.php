<?php
// ─── AvisoBusqueda ─────────────────────────────────────────────────────────
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class AvisoBusqueda extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'avisos_busqueda';

    protected $fillable = [
        'perfil_reclutador_id',
        'deporte', 'nombre', 'posicion_requerida', 'descripcion',
        'estatura_minima_cm', 'edad_minima', 'edad_maxima',
        'imagen', 'fecha_inicio', 'lugar', 'habilidades_clave', 'requisitos_ingreso',
        'estado', 'total_postulaciones', 'preseleccionados',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
    ];

    public function reclutador()
    {
        return $this->belongsTo(PerfilReclutador::class, 'perfil_reclutador_id');
    }

    public function postulaciones()
    {
        return $this->hasMany(Postulacion::class, 'aviso_id');
    }
}
