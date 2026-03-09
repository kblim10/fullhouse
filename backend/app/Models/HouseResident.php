<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HouseResident extends Model
{
    protected $fillable = [
        'house_id',
        'resident_id',
        'tanggal_masuk',
        'tanggal_keluar',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'tanggal_masuk' => 'date',
        'tanggal_keluar' => 'date',
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}
