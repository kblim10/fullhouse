<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    protected $fillable = [
        'nama_lengkap',
        'foto_ktp',
        'status_penghuni',
        'nomor_telepon',
        'status_menikah',
    ];

    protected $casts = [
        'status_menikah' => 'boolean',
    ];

    public function houseResidents()
    {
        return $this->hasMany(HouseResident::class);
    }

    public function houses()
    {
        return $this->belongsToMany(House::class, 'house_residents')
            ->withPivot('tanggal_masuk', 'tanggal_keluar', 'is_active')
            ->withTimestamps();
    }

    public function activeHouse()
    {
        return $this->houses()->wherePivot('is_active', true);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
