<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('videos_jugador', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perfil_jugador_id')
                  ->constrained('perfiles_jugador')
                  ->cascadeOnDelete();

            $table->string('titulo')->nullable();         // GOLES 2024
            $table->string('url');                        // YouTube / link directo
            $table->string('thumbnail')->nullable();
            $table->boolean('es_highlight')->default(false);
            $table->unsignedSmallInteger('orden')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos_jugador');
    }
};
