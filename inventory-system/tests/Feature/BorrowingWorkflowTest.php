<?php

namespace Tests\Feature;

use App\Models\Cupboard;
use App\Models\Item;
use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BorrowingWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_borrowing_reduces_stock_and_return_restores_stock()
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        $cupboard = Cupboard::create([
            'name' => 'Main Cupboard',
            'code' => 'CP-01',
        ]);

        $place = Place::create([
            'cupboard_id' => $cupboard->id,
            'name' => 'Shelf A',
            'code' => 'PL-01',
        ]);

        $item = Item::create([
            'place_id' => $place->id,
            'name' => 'Cordless Drill',
            'code' => 'ITM-001',
            'quantity' => 10,
            'status' => 'in_store',
        ]);

        $borrow = $this->postJson('/api/borrowings', [
            'item_id' => $item->id,
            'borrower_name' => 'Vendor Team',
            'borrower_contact' => '077-1234567',
            'borrow_date' => now()->toDateString(),
            'expected_return_date' => now()->addDays(2)->toDateString(),
            'quantity_borrowed' => 3,
        ]);

        $borrow->assertCreated()->assertJsonPath('status', 'borrowed');

        $item->refresh();
        $this->assertSame(7, $item->quantity);
        $this->assertSame('borrowed', $item->status);

        $borrowingId = $borrow->json('id');

        $this->postJson("/api/borrowings/{$borrowingId}/return")
            ->assertOk()
            ->assertJsonPath('status', 'returned');

        $item->refresh();
        $this->assertSame(10, $item->quantity);
        $this->assertSame('in_store', $item->status);
    }
}
