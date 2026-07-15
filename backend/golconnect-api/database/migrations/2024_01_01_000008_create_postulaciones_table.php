<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('postulaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aviso_id')
                  ->constrained('avisos_busqueda')
                  ->cascadeOnDelete();
            $table->foreignId('perfil_jugador_id')
                  ->constrained('perfiles_jugador')
                  ->cascadeOnDelete();

            // Estado visible en MisPostulaciones
            $table->enum('estado', [
                'enviada',       // Enviada
                'en_revision',   // En Revisión
                'confirmada',    // Prueba confirmada
                'finalizada',    // Finalizada / cerrada
            ])->default('enviada');

            $table->date('fecha_prueba')->nullable();    // cuando se confirma
            $table->text('notas_reclutador')->nullable();
            $table->boolean('preseleccionado')->default(false);

            $table->timestamps();

            // Un jugador solo puede postularse una vez por aviso
            $table->unique(['aviso_id', 'perfil_jugador_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('postulaciones');
    }
};
