<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('credenciales_reclutador', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perfil_reclutador_id')
                  ->constrained('perfiles_reclutador')
                  ->cascadeOnDelete();

            $table->string('titulo');           // Licencia UEFA Pro
            $table->string('identificador')->nullable(); // UEFA-2024-AM
            $table->string('estado')->default('verificada'); // verificada / pendiente / vencida
            $table->year('expira')->nullable();
            $table->string('archivo_path')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credenciales_reclutador');
    }
};
