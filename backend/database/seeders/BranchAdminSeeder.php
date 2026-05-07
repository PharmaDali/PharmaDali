<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class BranchAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        User::updateOrCreate(
            ['email' => 'branchadmin@gmail.com'],
            [
                'first_name'    => 'James',
                'last_name'     => 'Mercado',
                'password'      => Hash::make('password1234'),
                'role'          => 'branch_admin',
                'mobile_number' => '09123456789',
                'is_active'     => true,
                'branch_id'     => 1,
            ]
        );
    }
}
