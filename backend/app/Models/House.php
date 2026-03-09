<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    protected $fillable = [
        'nomor_rumah',
        'alamat',
        'status_rumah',
    ];

    public function houseResidents()
    {
        return $this->hasMany(HouseResident::class);
    }

    public function residents()
    {
        return $this->belongsToMany(Resident::class, 'house_residents')
            ->withPivot('tanggal_masuk', 'tanggal_keluar', 'is_active')
            ->withTimestamps();
    }

    public function activeResident()
    {
        return $this->residents()->wherePivot('is_active', true);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
