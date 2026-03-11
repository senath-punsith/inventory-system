<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Item extends Model
{
    use HasFactory;

    protected $appends = ['image_url'];

    protected $fillable = [
        'place_id',
        'name',
        'code',
        'quantity',
        'serial_number',
        'image_path',
        'description',
        'status',
    ];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function borrowings()
    {
        return $this->hasMany(Borrowing::class);
    }

    public function getImageUrlAttribute()
    {
        if (!$this->image_path) {
            return null;
        }

        return Storage::disk('public')->url($this->image_path);
    }
}
