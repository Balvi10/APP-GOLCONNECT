<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('tipo');    // pro_activado | nueva_postulacion | scout_vio_perfil | etc.
            $table->string('titulo');
            $table->text('cuerpo')->nullable();
            $table->json('data')->nullable();  // payload extra para la app
            $table->timestamp('leida_en')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
