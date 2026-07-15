<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('perfiles_reclutador', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('cargo')->nullable();           // Reclutador Senior
            $table->string('institucion')->nullable();     // Atlético Madrid
            $table->string('categoria')->nullable();       // Primera División
            $table->string('ciudad')->nullable();
            $table->string('pais')->nullable();

            // Métricas públicas
            $table->unsignedSmallInteger('anios_experiencia')->default(0);
            $table->unsignedSmallInteger('fichajes_realizados')->default(0);

            // Verificación
            $table->boolean('verificado')->default(false);
            $table->string('credencial_path')->nullable(); // archivo subido (JPG/PDF)
            $table->timestamp('verificado_en')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perfiles_reclutador');
    }
};
