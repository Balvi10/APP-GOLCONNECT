<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('trayectoria_jugador', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perfil_jugador_id')
                  ->constrained('perfiles_jugador')
                  ->cascadeOnDelete();

            $table->string('club');                    // CA Huracán
            $table->string('division')->nullable();    // Primera División
            $table->string('categoria')->nullable();   // Reserva / Inferiores
            $table->unsignedSmallInteger('partidos')->nullable();
            $table->year('temporada_inicio')->nullable();
            $table->year('temporada_fin')->nullable();
            $table->unsignedSmallInteger('orden')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trayectoria_jugador');
    }
};
