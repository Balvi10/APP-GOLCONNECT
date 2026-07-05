<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Búsquedas guardadas como favoritas por el reclutador
        Schema::create('busquedas_favoritas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perfil_reclutador_id')
                  ->constrained('perfiles_reclutador')
                  ->cascadeOnDelete();
            $table->string('etiqueta');   // "Extremos Sub-19 · Latam"
            $table->json('filtros')->nullable();
            $table->timestamps();
        });

        // Red de contactos entre reclutadores
        Schema::create('red_reclutadores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reclutador_id')
                  ->constrained('perfiles_reclutador')
                  ->cascadeOnDelete();
            $table->foreignId('contacto_id')
                  ->constrained('perfiles_reclutador')
                  ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['reclutador_id', 'contacto_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('red_reclutadores');
        Schema::dropIfExists('busquedas_favoritas');
    }
};
