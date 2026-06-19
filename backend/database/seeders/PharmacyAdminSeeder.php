<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PharmacyAdminSeeder extends Seeder
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
                'role'          => 'pharmacy_admin',
                'mobile_number' => '09123456789',
                'is_active'     => true,
                'pharmacy_id'     => 1,
            ]
        );
    }
}
