<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ItemController extends Controller
{
    public function index()
    {
        return response()->json(Item::query()->with(['place.cupboard'])->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'place_id' => ['required', 'exists:places,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', 'unique:items,code'],
            'quantity' => ['required', 'integer', 'min:0'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:5120'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:in_store,borrowed,damaged,missing'],
        ]);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('items', 'public');
        }

        unset($data['image']);

        $item = Item::create($data);

        ActivityLogger::log('item_created', 'item', $item->id, null, $item->toArray());

        return response()->json($item, 201);
    }

    public function show(Item $item)
    {
        return response()->json($item->load(['place.cupboard', 'borrowings']));
    }

    public function update(Request $request, Item $item)
    {
        $data = $request->validate([
            'place_id' => ['sometimes', 'exists:places,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:100', 'unique:items,code,' . $item->id],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:5120'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:in_store,borrowed,damaged,missing'],
        ]);

        $old = $item->toArray();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('items', 'public');
        }

        unset($data['image']);

        $item->update($data);

        ActivityLogger::log('item_updated', 'item', $item->id, $old, $item->fresh()->toArray());

        return response()->json($item->fresh());
    }

    public function destroy(Item $item)
    {
        $old = $item->toArray();
        $item->delete();

        ActivityLogger::log('item_deleted', 'item', $item->id, $old, null);

        return response()->json([], 204);
    }

    public function adjustQuantity(Request $request, Item $item)
    {
        $data = $request->validate([
            'operation' => ['required', 'in:increment,decrement'],
            'amount' => ['required', 'integer', 'min:1'],
        ]);

        $before = ['quantity' => $item->quantity];

        DB::transaction(function () use ($item, $data) {
            $lockedItem = Item::query()->lockForUpdate()->findOrFail($item->id);

            if ($data['operation'] === 'decrement' && $lockedItem->quantity < $data['amount']) {
                abort(422, 'Insufficient stock for decrement operation.');
            }

            $newQuantity = $data['operation'] === 'increment'
                ? $lockedItem->quantity + $data['amount']
                : $lockedItem->quantity - $data['amount'];

            $lockedItem->update(['quantity' => $newQuantity]);
        });

        $item->refresh();

        ActivityLogger::log(
            'item_quantity_changed',
            'item',
            $item->id,
            $before,
            [
                'quantity' => $item->quantity,
                'operation' => $data['operation'],
                'amount' => $data['amount'],
            ]
        );

        return response()->json($item);
    }

    public function updateStatus(Request $request, Item $item)
    {
        $data = $request->validate([
            'status' => ['required', 'in:in_store,borrowed,damaged,missing'],
        ]);

        $allowedTransitions = [
            'in_store' => ['borrowed', 'damaged', 'missing'],
            'borrowed' => ['in_store', 'damaged', 'missing'],
            'damaged' => ['in_store', 'missing'],
            'missing' => ['in_store'],
        ];

        if ($item->status !== $data['status'] && !in_array($data['status'], $allowedTransitions[$item->status], true)) {
            return response()->json([
                'message' => 'Invalid status transition.',
            ], 422);
        }

        $before = ['status' => $item->status];
        $item->update(['status' => $data['status']]);

        ActivityLogger::log('item_status_changed', 'item', $item->id, $before, ['status' => $item->status]);

        return response()->json($item);
    }
}
