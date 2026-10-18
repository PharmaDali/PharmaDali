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
                'pharmacy_id'   => 1,
            ]
        );

        $pharmacistUser = User::updateOrCreate(
            ['email' => 'pharmacist@gmail.com'],
            [
                'first_name'               => 'Test',
                'last_name'                => 'Pharmacist',
                'password'                 => Hash::make('password1234'),
                'role'                     => 'pharmacist',
                'mobile_number'            => '09123456781',
                'is_active'                => true,
                'pharmacy_id'              => 1,
                'requires_password_change' => false,
            ]
        );

        \App\Models\Pharmacist::updateOrCreate(
            ['user_id' => $pharmacistUser->id],
            [
                'employee_number'          => 'EMP-' . str_pad((string) $pharmacistUser->id, 4, '0', STR_PAD_LEFT),
                'license_number'           => 'PRC-0123456',
                'permissions'              => \App\Models\Pharmacist::DEFAULT_PERMISSIONS,
                'requires_password_change' => false,
            ]
        );
    }
}
