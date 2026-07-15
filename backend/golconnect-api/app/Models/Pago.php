<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pago extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'plan', 'monto', 'moneda',
        'estado', 'comprobante_path',
        'confirmado_en', 'expira_en', 'notas_admin',
    ];

    protected $casts = [
        'confirmado_en' => 'datetime',
        'expira_en'     => 'datetime',
        'monto'         => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Confirma el pago y activa el plan PRO del jugador.
     */
    public function confirmar(): void
    {
        $this->update([
            'estado'        => 'confirmado',
            'confirmado_en' => now(),
            'expira_en'     => now()->addDays(30),
        ]);

        $perfil = $this->user->perfilJugador;
        if ($perfil) {
            $perfil->update([
                'plan'            => 'pro',
                'pro_activado_en' => now(),
                'pro_expira_en'   => now()->addDays(30),
                'pro_pendiente'   => false,
            ]);

            // Crear notificación de activación
            Notificacion::create([
                'user_id' => $this->user_id,
                'tipo'    => 'pro_activado',
                'titulo'  => '¡Tu perfil PRO está activo!',
                'cuerpo'  => 'Ya podés aparecer en el radar de los mejores scouts del mundo.',
            ]);
        }
    }
}
