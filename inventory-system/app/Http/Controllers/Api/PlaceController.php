<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;

class PlaceController extends Controller
{
    public function index()
    {
        return response()->json(Place::query()->with('cupboard')->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cupboard_id' => ['required', 'exists:cupboards,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', 'unique:places,code'],
            'description' => ['nullable', 'string'],
        ]);

        $place = Place::create($data);

        ActivityLogger::log('place_created', 'place', $place->id, null, $place->toArray());

        return response()->json($place, 201);
    }

    public function show(Place $place)
    {
        return response()->json($place->load(['cupboard', 'items']));
    }

    public function update(Request $request, Place $place)
    {
        $data = $request->validate([
            'cupboard_id' => ['sometimes', 'exists:cupboards,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:100', 'unique:places,code,' . $place->id],
            'description' => ['nullable', 'string'],
        ]);

        $old = $place->toArray();
        $place->update($data);

        ActivityLogger::log('place_updated', 'place', $place->id, $old, $place->fresh()->toArray());

        return response()->json($place);
    }

    public function destroy(Place $place)
    {
        $old = $place->toArray();
        $place->delete();

        ActivityLogger::log('place_deleted', 'place', $place->id, $old, null);

        return response()->json([], 204);
    }
}
