<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (User::where('role', 'super_admin')->exists()) {
            $this->command->info('Super admin already exists. Skipping seeding.');
            return;
        }

        User::create([
            'first_name'    => env('SUPER_ADMIN_FIRST_NAME', 'Super'),
            'last_name'     => env('SUPER_ADMIN_LAST_NAME', 'Admin'),
            'email'         => env('SUPER_ADMIN_EMAIL'),
            'password'      => Hash::make(env('SUPER_ADMIN_PASSWORD')),
            'role'          => 'super_admin',
            'mobile_number' => env('SUPER_ADMIN_MOBILE', '00000000000'),
            'is_active'     => true,
        ]);

        $this->command->info('Super admin created successfully.');
    }
}
