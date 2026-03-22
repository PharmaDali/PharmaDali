<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'branch_name',
        'location',
        'contact_number',
        'is_active',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function admins()
    {
        return $this->hasMany(User::class)->where('role', 'branch_admin');
    }

    public function pharmacists()
    {
        return $this->hasMany(User::class)->where('role', 'pharmacist');    
    }
}
