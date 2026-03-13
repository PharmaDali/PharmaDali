<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Post extends Model
{
    // Allow mass assignment for these fields

    protected $fillable = ['user_id', 'title', 'body'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
