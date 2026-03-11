<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthAndAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_and_receive_token()
    {
        $user = User::factory()->create([
            'password' => 'secret1234',
            'role' => 'staff',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'secret1234',
        ]);

        $response->assertOk()->assertJsonStructure([
            'token',
            'token_type',
            'user' => ['id', 'name', 'email', 'role'],
        ]);
    }

    public function test_staff_cannot_create_users_or_view_activity_logs()
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);

        $this->postJson('/api/users', [
            'name' => 'Blocked User',
            'email' => 'blocked@example.com',
            'password' => 'password123',
            'role' => 'staff',
        ])->assertForbidden();

        $this->getJson('/api/activity-logs')->assertForbidden();
    }

    public function test_admin_can_create_user_and_assign_role()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $create = $this->postJson('/api/users', [
            'name' => 'Staff One',
            'email' => 'staff.one@example.com',
            'password' => 'password123',
            'role' => 'staff',
        ]);

        $create->assertCreated()->assertJsonPath('role', 'staff');

        $userId = $create->json('id');

        $this->patchJson("/api/users/{$userId}/role", ['role' => 'admin'])
            ->assertOk()
            ->assertJsonPath('role', 'admin');
    }
}
