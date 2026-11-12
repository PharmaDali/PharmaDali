<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Pharmacist;
use App\Models\User;
use App\Notifications\PharmacistWelcomeNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserSeeder extends Seeder
{
    /**
     * Seed users with realistic common names for local development.
     */
    public function run(): void
    {
        // 1. Super Admin: Gabriel Ramos
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@pharmadali.com'],
            [
                'first_name'    => 'Gabriel',
                'last_name'     => 'Ramos',
                'password'      => Hash::make('password1234'),
                'role'          => 'super_admin',
                'mobile_number' => '09171112233',
                'address'       => 'Tanauan City, Batangas',
                'is_active'     => true,
            ]
        );
        $this->command?->info("Super Admin created: {$superAdmin->first_name} {$superAdmin->last_name} ({$superAdmin->email})");

        // 2. Pharmacy Admin: James Mercado
        $pharmacyAdmin = User::updateOrCreate(
            ['email' => 'jamesmercado2209@gmail.com'],
            [
                'first_name'    => 'James',
                'last_name'     => 'Mercado',
                'password'      => Hash::make('password1234'),
                'role'          => 'pharmacy_admin',
                'mobile_number' => '09172223344',
                'address'       => 'Tanauan City, Batangas',
                'pharmacy_id'   => 1,
                'is_active'     => true,
            ]
        );
        $this->command?->info("Pharmacy Admin created: {$pharmacyAdmin->first_name} {$pharmacyAdmin->last_name} ({$pharmacyAdmin->email})");

        // 3. Pharmacist: Angelo Reyes (Initial State with Temporary Password)
        $tempPassword = 'PharmaDali#2026';

        $pharmacistUser = User::updateOrCreate(
            ['email' => 'pharmadalipharmacist@gmail.com'],
            [
                'first_name'               => 'Angelo',
                'last_name'                => 'Reyes',
                'password'                 => Hash::make($tempPassword),
                'role'                     => 'pharmacist',
                'mobile_number'            => '09173334455',
                'address'                  => 'Tanauan City, Batangas',
                'pharmacy_id'              => 1,
                'is_active'                => true,
                'requires_password_change' => true,
            ]
        );

        $employeeNumber = 'PHAR-' . str_pad((string) $pharmacistUser->id, 4, '0', STR_PAD_LEFT) . '-1';

        $pharmacistProfile = Pharmacist::updateOrCreate(
            ['user_id' => $pharmacistUser->id],
            [
                'employee_number'          => $employeeNumber,
                'license_number'           => 'PRC-0123456',
                'permissions'              => Pharmacist::DEFAULT_PERMISSIONS,
                'requires_password_change' => true,
                'is_on_duty'               => true,
                'duty_updated_at'          => now(),
            ]
        );

        $this->command?->info("Pharmacist created: {$pharmacistUser->first_name} {$pharmacistUser->last_name} ({$pharmacistUser->email}) | Emp#: {$employeeNumber}");

        // Dispatch Welcome Email to Pharmacist
        try {
            $pharmacistUser->notify(new PharmacistWelcomeNotification(
                employeeNumber: $employeeNumber,
                temporaryPassword: $tempPassword
            ));
            $this->command?->info("Welcome notification email sent to {$pharmacistUser->email}");
        } catch (\Throwable $e) {
            $this->command?->warn("Could not send pharmacist welcome email: " . $e->getMessage());
            Log::warning("Pharmacist welcome email failed during seeding: " . $e->getMessage());
        }

        // 4. Customer: Juan Dela Cruz
        $customerUser = User::updateOrCreate(
            ['email' => 'customer@gmail.com'],
            [
                'first_name'    => 'Juan',
                'last_name'     => 'Dela Cruz',
                'password'      => Hash::make('password1234'),
                'role'          => 'customer',
                'mobile_number' => '09174445566',
                'address'       => 'Tanauan City, Batangas',
                'is_active'     => true,
            ]
        );

        Customer::updateOrCreate(
            ['user_id' => $customerUser->id],
            ['pharmacy_id' => 1]
        );

        $this->command?->info("Customer created: {$customerUser->first_name} {$customerUser->last_name} ({$customerUser->email})");
    }
}
