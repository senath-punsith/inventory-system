<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@ceyntics.local'],
            [
                'name' => 'System Admin',
                'role' => 'admin',
                'password' => Hash::make('ChangeMe123!'),
            ]
        );
    }
}
