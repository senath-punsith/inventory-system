<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use App\Models\Item;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BorrowingController extends Controller
{
    public function index()
    {
        return response()->json(
            Borrowing::query()
                ->with(['item', 'processedBy'])
                ->latest()
                ->paginate(20)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'item_id' => ['required', 'exists:items,id'],
            'borrower_name' => ['required', 'string', 'max:255'],
            'borrower_contact' => ['required', 'string', 'max:255'],
            'borrow_date' => ['required', 'date'],
            'expected_return_date' => ['nullable', 'date', 'after_or_equal:borrow_date'],
            'quantity_borrowed' => ['required', 'integer', 'min:1'],
        ]);

        $result = DB::transaction(function () use ($data, $request) {
            $item = Item::lockForUpdate()->findOrFail($data['item_id']);

            if (in_array($item->status, ['damaged', 'missing'], true)) {
                abort(422, 'Damaged or missing items cannot be borrowed.');
            }

            if ($item->quantity < $data['quantity_borrowed']) {
                abort(422, 'Insufficient stock for borrowing.');
            }

            $before = ['quantity' => $item->quantity, 'status' => $item->status];

            $item->update([
                'quantity' => $item->quantity - $data['quantity_borrowed'],
                'status' => 'borrowed',
            ]);

            $borrowing = Borrowing::create([
                'item_id' => $item->id,
                'processed_by' => $request->user()->id,
                'borrower_name' => $data['borrower_name'],
                'borrower_contact' => $data['borrower_contact'],
                'borrow_date' => $data['borrow_date'],
                'expected_return_date' => $data['expected_return_date'] ?? null,
                'quantity_borrowed' => $data['quantity_borrowed'],
                'status' => 'borrowed',
            ]);

            ActivityLogger::log('item_borrowed', 'borrowing', $borrowing->id, null, $borrowing->toArray());
            ActivityLogger::log('item_quantity_changed', 'item', $item->id, $before, ['quantity' => $item->quantity, 'status' => $item->status]);

            return $borrowing;
        });

        return response()->json($result->load(['item', 'processedBy']), 201);
    }

    public function returnItem(Borrowing $borrowing)
    {
        if ($borrowing->status === 'returned') {
            return response()->json([
                'message' => 'This borrowing record is already returned.',
            ], 422);
        }

        DB::transaction(function () use ($borrowing) {
            $item = Item::lockForUpdate()->findOrFail($borrowing->item_id);
            $before = ['quantity' => $item->quantity, 'status' => $item->status];

            $activeBorrowings = Borrowing::query()
                ->where('item_id', $item->id)
                ->where('status', 'borrowed')
                ->where('id', '!=', $borrowing->id)
                ->count();

            $item->update([
                'quantity' => $item->quantity + $borrowing->quantity_borrowed,
                'status' => $activeBorrowings > 0 ? 'borrowed' : 'in_store',
            ]);

            $oldBorrowing = $borrowing->toArray();

            $borrowing->update([
                'status' => 'returned',
                'returned_at' => now(),
            ]);

            ActivityLogger::log('item_returned', 'borrowing', $borrowing->id, $oldBorrowing, $borrowing->fresh()->toArray());
            ActivityLogger::log('item_quantity_changed', 'item', $item->id, $before, ['quantity' => $item->quantity, 'status' => $item->status]);
        });

        return response()->json($borrowing->fresh()->load(['item', 'processedBy']));
    }
}
