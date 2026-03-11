<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::query()->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:admin,staff'],
        ]);

        $user = User::create($data);

        ActivityLogger::log('user_created', 'user', $user->id, null, $user->only(['name', 'email', 'role']));

        return response()->json($user, 201);
    }

    public function updateRole(Request $request, User $user)
    {
        $data = $request->validate([
            'role' => ['required', 'in:admin,staff'],
        ]);

        $old = ['role' => $user->role];
        $user->update(['role' => $data['role']]);

        ActivityLogger::log('user_role_changed', 'user', $user->id, $old, ['role' => $user->role]);

        return response()->json($user);
    }
}
