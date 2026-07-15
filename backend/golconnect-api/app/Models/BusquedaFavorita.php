<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BusquedaFavorita extends Model
{
    protected $table    = 'busquedas_favoritas';
    protected $fillable = ['perfil_reclutador_id','etiqueta','filtros'];
    protected $casts    = ['filtros' => 'array'];
    public function reclutador() { return $this->belongsTo(PerfilReclutador::class,'perfil_reclutador_id'); }
}
