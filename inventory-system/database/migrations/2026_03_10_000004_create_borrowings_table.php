<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('borrowings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('processed_by')->constrained('users');
            $table->string('borrower_name');
            $table->string('borrower_contact');
            $table->date('borrow_date');
            $table->date('expected_return_date')->nullable();
            $table->unsignedInteger('quantity_borrowed');
            $table->enum('status', ['borrowed', 'returned'])->default('borrowed');
            $table->timestamp('returned_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('borrowings');
    }
};
