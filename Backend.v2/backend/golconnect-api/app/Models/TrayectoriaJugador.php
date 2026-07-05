<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TrayectoriaJugador extends Model
{
    protected $table    = 'trayectoria_jugador';
    protected $fillable = ['perfil_jugador_id','club','division','categoria','partidos','temporada_inicio','temporada_fin','orden'];
    public function jugador() { return $this->belongsTo(PerfilJugador::class,'perfil_jugador_id'); }
}
