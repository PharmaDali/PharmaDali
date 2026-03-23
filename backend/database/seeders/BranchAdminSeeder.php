<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class BranchAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'first_name'    => 'James',
            'last_name'     => 'Mercado',
            'email'         => 'branchadmin@gmail.com',
            'password'      => Hash::make('password1234'),
            'role'          => 'branch_admin',
            'mobile_number' => '09123456789',
            'is_active'     => true,
            'branch_id'     => 1, 
        ]);
    }
}
