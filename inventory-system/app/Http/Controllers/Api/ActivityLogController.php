<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    public function index()
    {
        return response()->json(
            ActivityLog::query()
                ->with('user:id,name,email,role')
                ->latest()
                ->paginate(50)
        );
    }
}
