<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ContactoJugador extends Model
{
    protected $table = 'contactos_jugador';
    protected $fillable = [
        'perfil_reclutador_id','perfil_jugador_id',
        'tipo','canal','estado','fecha_reunion','notas',
    ];
    protected $casts = ['fecha_reunion' => 'datetime'];

    public function reclutador() { return $this->belongsTo(PerfilReclutador::class,'perfil_reclutador_id'); }
    public function jugador()    { return $this->belongsTo(PerfilJugador::class,'perfil_jugador_id'); }
}
