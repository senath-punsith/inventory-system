<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Borrowing;
use App\Models\Cupboard;
use App\Models\Item;
use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InventoryRulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_decrement_item_below_zero()
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);

        $item = $this->createItem(['quantity' => 1]);

        $this->postJson("/api/items/{$item->id}/quantity", [
            'operation' => 'decrement',
            'amount' => 2,
        ])->assertStatus(422)
            ->assertSeeText('Insufficient stock for decrement operation.');

        $this->assertSame(1, $item->fresh()->quantity);
    }

    public function test_invalid_status_transition_is_rejected()
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);

        $item = $this->createItem(['status' => 'missing']);

        $this->patchJson("/api/items/{$item->id}/status", [
            'status' => 'borrowed',
        ])->assertStatus(422)
            ->assertJsonPath('message', 'Invalid status transition.');

        $this->assertSame('missing', $item->fresh()->status);
    }

    public function test_cannot_borrow_damaged_or_missing_item()
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);

        $item = $this->createItem([
            'quantity' => 4,
            'status' => 'damaged',
        ]);

        $this->postJson('/api/borrowings', [
            'item_id' => $item->id,
            'borrower_name' => 'Maintenance Team',
            'borrower_contact' => '077-1111111',
            'borrow_date' => now()->toDateString(),
            'expected_return_date' => now()->addDay()->toDateString(),
            'quantity_borrowed' => 1,
        ])->assertStatus(422)
            ->assertSeeText('Damaged or missing items cannot be borrowed.');

        $this->assertDatabaseCount('borrowings', 0);
        $this->assertSame(4, $item->fresh()->quantity);
    }

    public function test_returning_one_of_multiple_borrowings_keeps_item_borrowed()
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);

        $item = $this->createItem(['quantity' => 10, 'status' => 'in_store']);

        $first = Borrowing::create([
            'item_id' => $item->id,
            'processed_by' => $staff->id,
            'borrower_name' => 'Team Alpha',
            'borrower_contact' => '077-1000000',
            'borrow_date' => now()->toDateString(),
            'expected_return_date' => now()->addDays(3)->toDateString(),
            'quantity_borrowed' => 3,
            'status' => 'borrowed',
        ]);

        $second = Borrowing::create([
            'item_id' => $item->id,
            'processed_by' => $staff->id,
            'borrower_name' => 'Team Beta',
            'borrower_contact' => '077-2000000',
            'borrow_date' => now()->toDateString(),
            'expected_return_date' => now()->addDays(4)->toDateString(),
            'quantity_borrowed' => 2,
            'status' => 'borrowed',
        ]);

        $item->update([
            'quantity' => 5,
            'status' => 'borrowed',
        ]);

        $this->postJson("/api/borrowings/{$first->id}/return")
            ->assertOk()
            ->assertJsonPath('status', 'returned');

        $item->refresh();
        $second->refresh();

        $this->assertSame(8, $item->quantity);
        $this->assertSame('borrowed', $item->status);
        $this->assertSame('borrowed', $second->status);
    }

    public function test_cupboard_and_place_crud_actions_are_logged()
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);

        $createCupboard = $this->postJson('/api/cupboards', [
            'name' => 'Lab Cupboard',
            'code' => 'CP-LAB-01',
            'description' => 'For tools',
        ])->assertCreated();

        $cupboardId = $createCupboard->json('id');

        $createPlace = $this->postJson('/api/places', [
            'cupboard_id' => $cupboardId,
            'name' => 'Rack A',
            'code' => 'PL-RACK-A',
            'description' => 'Upper rack',
        ])->assertCreated();

        $placeId = $createPlace->json('id');

        $this->patchJson("/api/cupboards/{$cupboardId}", [
            'name' => 'Lab Cupboard Updated',
        ])->assertOk();

        $this->patchJson("/api/places/{$placeId}", [
            'name' => 'Rack A Updated',
        ])->assertOk();

        $this->deleteJson("/api/places/{$placeId}")->assertNoContent();
        $this->deleteJson("/api/cupboards/{$cupboardId}")->assertNoContent();

        $actions = ActivityLog::query()
            ->whereIn('action', [
                'cupboard_created',
                'cupboard_updated',
                'cupboard_deleted',
                'place_created',
                'place_updated',
                'place_deleted',
            ])
            ->pluck('action')
            ->all();

        $this->assertContains('cupboard_created', $actions);
        $this->assertContains('cupboard_updated', $actions);
        $this->assertContains('cupboard_deleted', $actions);
        $this->assertContains('place_created', $actions);
        $this->assertContains('place_updated', $actions);
        $this->assertContains('place_deleted', $actions);
    }

    private function createItem(array $overrides = []): Item
    {
        $cupboard = Cupboard::create([
            'name' => 'Main Cupboard',
            'code' => 'CP-MAIN-' . str_pad((string) random_int(1, 999), 3, '0', STR_PAD_LEFT),
        ]);

        $place = Place::create([
            'cupboard_id' => $cupboard->id,
            'name' => 'Shelf A',
            'code' => 'PL-SHELF-' . str_pad((string) random_int(1, 999), 3, '0', STR_PAD_LEFT),
        ]);

        return Item::create(array_merge([
            'place_id' => $place->id,
            'name' => 'Power Tool',
            'code' => 'ITM-' . str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT),
            'quantity' => 5,
            'status' => 'in_store',
        ], $overrides));
    }
}
