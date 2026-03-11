<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cupboard;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;

class CupboardController extends Controller
{
    public function index()
    {
        return response()->json(Cupboard::query()->withCount('places')->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', 'unique:cupboards,code'],
            'description' => ['nullable', 'string'],
        ]);

        $cupboard = Cupboard::create($data);

        ActivityLogger::log('cupboard_created', 'cupboard', $cupboard->id, null, $cupboard->toArray());

        return response()->json($cupboard, 201);
    }

    public function show(Cupboard $cupboard)
    {
        return response()->json($cupboard->load('places'));
    }

    public function update(Request $request, Cupboard $cupboard)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:100', 'unique:cupboards,code,' . $cupboard->id],
            'description' => ['nullable', 'string'],
        ]);

        $old = $cupboard->toArray();
        $cupboard->update($data);

        ActivityLogger::log('cupboard_updated', 'cupboard', $cupboard->id, $old, $cupboard->fresh()->toArray());

        return response()->json($cupboard);
    }

    public function destroy(Cupboard $cupboard)
    {
        $old = $cupboard->toArray();
        $cupboard->delete();

        ActivityLogger::log('cupboard_deleted', 'cupboard', $cupboard->id, $old, null);

        return response()->json([], 204);
    }
}
