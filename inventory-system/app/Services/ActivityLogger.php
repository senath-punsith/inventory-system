<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    /**
     * Record a system activity with old/new values for auditability.
     *
     * @param string $action
     * @param string $entityType
     * @param int|null $entityId
     * @param array|null $oldValues
     * @param array|null $newValues
     * @return void
     */
    public static function log($action, $entityType, $entityId = null, $oldValues = null, $newValues = null)
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}
