<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('plan')->default('pro_mensual');
            $table->decimal('monto', 8, 2);
            $table->string('moneda', 3)->default('USD');

            // Estado (el flujo manual: el user paga por transferencia y se verifica)
            $table->enum('estado', [
                'pendiente',    // esperando confirmación manual
                'confirmado',   // verificado → activa el plan PRO
                'rechazado',
            ])->default('pendiente');

            // Comprobante que el usuario envía por WhatsApp
            $table->string('comprobante_path')->nullable();

            $table->timestamp('confirmado_en')->nullable();
            $table->timestamp('expira_en')->nullable();
            $table->text('notas_admin')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
