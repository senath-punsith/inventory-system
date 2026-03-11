<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("ALTER TABLE items ADD CONSTRAINT items_quantity_non_negative CHECK (quantity >= 0)");
        DB::statement("ALTER TABLE borrowings ADD CONSTRAINT borrowings_quantity_positive CHECK (quantity_borrowed > 0)");
        DB::statement("ALTER TABLE borrowings ADD CONSTRAINT borrowings_expected_return_valid CHECK (expected_return_date IS NULL OR expected_return_date >= borrow_date)");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("ALTER TABLE borrowings DROP CONSTRAINT IF EXISTS borrowings_expected_return_valid");
        DB::statement("ALTER TABLE borrowings DROP CONSTRAINT IF EXISTS borrowings_quantity_positive");
        DB::statement("ALTER TABLE items DROP CONSTRAINT IF EXISTS items_quantity_non_negative");
    }
};
