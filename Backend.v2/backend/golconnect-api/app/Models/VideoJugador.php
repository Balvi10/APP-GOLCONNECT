<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class VideoJugador extends Model
{
    protected $table    = 'videos_jugador';
    protected $fillable = ['perfil_jugador_id','titulo','url','thumbnail','es_highlight','orden'];
    protected $casts    = ['es_highlight' => 'boolean'];
    public function jugador() { return $this->belongsTo(PerfilJugador::class,'perfil_jugador_id'); }
}
