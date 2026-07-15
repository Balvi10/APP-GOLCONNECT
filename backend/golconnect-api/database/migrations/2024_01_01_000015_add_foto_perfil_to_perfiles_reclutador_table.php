<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * La tabla perfiles_reclutador nunca tuvo columna para la foto de perfil
     * (a diferencia de perfiles_jugador, que sí la tiene desde el inicio).
     * Esto hacía que el endpoint POST /api/reclutador/perfil/foto fallara
     * silenciosamente con un error SQL de columna inexistente cada vez que
     * un reclutador intentaba subir su foto.
     */
    public function up(): void
    {
        Schema::table('perfiles_reclutador', function (Blueprint $table) {
            if (!Schema::hasColumn('perfiles_reclutador', 'foto_perfil')) {
                $table->string('foto_perfil')->nullable()->after('pais');
            }
        });
    }

    public function down(): void
    {
        Schema::table('perfiles_reclutador', function (Blueprint $table) {
            if (Schema::hasColumn('perfiles_reclutador', 'foto_perfil')) {
                $table->dropColumn('foto_perfil');
            }
        });
    }
};
