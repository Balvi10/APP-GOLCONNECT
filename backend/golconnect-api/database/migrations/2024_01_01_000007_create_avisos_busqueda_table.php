<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('avisos_busqueda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perfil_reclutador_id')
                  ->constrained('perfiles_reclutador')
                  ->cascadeOnDelete();

            // Paso 1 - Detalles del reclutamiento
            $table->string('deporte')->default('Fútbol Masculino');
            $table->string('nombre');                   // Búsqueda Delantero 2026
            $table->string('posicion_requerida');       // Delantero Centro
            $table->text('descripcion')->nullable();

            // Paso 2 - Requisitos físicos
            $table->unsignedSmallInteger('estatura_minima_cm')->nullable();
            $table->unsignedTinyInteger('edad_minima')->nullable();
            $table->unsignedTinyInteger('edad_maxima')->nullable();

            // Paso 3 - Detalles de la prueba
            $table->string('imagen')->nullable();       // imagen destacada
            $table->datetime('fecha_inicio')->nullable();
            $table->string('lugar')->nullable();        // Estadio Metropolitano
            $table->string('habilidades_clave')->nullable();
            $table->text('requisitos_ingreso')->nullable();

            // Estado del aviso
            $table->enum('estado', ['activo', 'pausado', 'finalizado'])->default('activo');
            $table->unsignedInteger('total_postulaciones')->default(0);
            $table->unsignedInteger('preseleccionados')->default(0);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avisos_busqueda');
    }
};
