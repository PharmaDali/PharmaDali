<?php

namespace Database\Seeders;

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
        $superAdminEmail = env('SUPER_ADMIN_EMAIL', 'superadmin@pharmadali.com');

        User::updateOrCreate(
            ['email' => $superAdminEmail],
            [
                'first_name'    => env('SUPER_ADMIN_FIRST_NAME', 'Super'),
                'last_name'     => env('SUPER_ADMIN_LAST_NAME', 'Admin'),
                'password'      => Hash::make(env('SUPER_ADMIN_PASSWORD', 'admin1234')),
                'role'          => 'super_admin',
                'mobile_number' => env('SUPER_ADMIN_MOBILE', '00000000000'),
                'is_active'     => true,
            ]
        );

        $this->command->info('Super admin ensured successfully.');
    }
}
