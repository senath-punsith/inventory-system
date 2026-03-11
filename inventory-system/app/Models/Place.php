<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Place extends Model
{
    use HasFactory;

    protected $fillable = [
        'cupboard_id',
        'name',
        'code',
        'description',
    ];

    public function cupboard()
    {
        return $this->belongsTo(Cupboard::class);
    }

    public function items()
    {
        return $this->hasMany(Item::class);
    }
}
