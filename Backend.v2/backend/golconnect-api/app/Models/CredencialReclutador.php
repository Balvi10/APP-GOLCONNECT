<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CredencialReclutador extends Model
{
    protected $table    = 'credenciales_reclutador';
    protected $fillable = ['perfil_reclutador_id','titulo','identificador','estado','expira','archivo_path'];
    public function reclutador() { return $this->belongsTo(PerfilReclutador::class,'perfil_reclutador_id'); }
}
