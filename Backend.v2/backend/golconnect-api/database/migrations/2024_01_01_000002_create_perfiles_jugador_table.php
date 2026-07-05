<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('perfiles_jugador', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Datos básicos
            $table->date('fecha_nacimiento')->nullable();
            $table->string('ciudad')->nullable();
            $table->string('pais')->nullable();
            $table->string('foto_perfil')->nullable(); // ruta al archivo

            // Atributos físicos
            $table->unsignedSmallInteger('altura_cm')->nullable();  // ej. 185
            $table->unsignedSmallInteger('peso_kg')->nullable();    // ej. 78
            $table->enum('pierna_habil', ['zurdo', 'diestro', 'ambidiestro'])->default('diestro');

            // Posición
            $table->string('posicion_principal')->nullable();   // Delantero Centro
            $table->string('posicion_secundaria')->nullable();  // Media Punta

            // Situación actual
            $table->enum('estado', ['libre', 'amateur', 'profesional'])->default('libre');
            $table->string('club_actual')->nullable();         // solo si profesional
            $table->string('liga_actual')->nullable();
            $table->string('division_actual')->nullable();

            // Suscripción
            $table->enum('plan', ['amateur', 'pro'])->default('amateur');
            $table->timestamp('pro_activado_en')->nullable();
            $table->timestamp('pro_expira_en')->nullable();
            $table->boolean('pro_pendiente')->default(false); // pago recibido, aún no activado

            // Stats de visibilidad (actualizados por jobs)
            $table->unsignedInteger('visitas_perfil')->default(0);
            $table->unsignedSmallInteger('clubes_interesados')->default(0);
            $table->unsignedSmallInteger('scouts_activos')->default(0);

            // Estadísticas de temporada
            $table->unsignedSmallInteger('temporada_partidos')->default(0);
            $table->unsignedSmallInteger('temporada_goles')->default(0);
            $table->unsignedSmallInteger('temporada_asistencias')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perfiles_jugador');
    }
};
