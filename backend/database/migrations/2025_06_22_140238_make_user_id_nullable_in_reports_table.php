<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
                        // Détacher d'abord la contrainte de clé étrangère
            $table->dropForeign(['user_id']);

            // Modifier le champ pour le rendre nullable
            $table->foreignId('user_id')->nullable()->change();

            // Réattacher la contrainte avec onDelete cascade
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): voids
    {
        Schema::table('reports', function (Blueprint $table) {
             $table->dropForeign(['user_id']);
            $table->foreignId('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
