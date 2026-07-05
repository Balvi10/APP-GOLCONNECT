<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contactos_jugador', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perfil_reclutador_id')
                  ->constrained('perfiles_reclutador')
                  ->cascadeOnDelete();
            $table->foreignId('perfil_jugador_id')
                  ->constrained('perfiles_jugador')
                  ->cascadeOnDelete();

            // Tipo de contacto (opciones de ContactarJugador.js)
            $table->enum('tipo', ['interes', 'prueba', 'reunion']);

            // Canal utilizado
            $table->enum('canal', ['email', 'whatsapp'])->nullable();

            // Estado para MisJugadoresReclutador
            $table->enum('estado', [
                'mensaje_enviado',
                'en_revision',
                'oferta_pendiente',
                'reunion_agendada',
                'cerrado',
            ])->default('mensaje_enviado');

            $table->datetime('fecha_reunion')->nullable();
            $table->text('notas')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contactos_jugador');
    }
};
