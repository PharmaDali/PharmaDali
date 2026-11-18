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

        // 2. Pharmacy Admins (One per pharmacy branch)
        // Clean up any old placeholder admin emails if they were previously seeded
        User::whereIn('email', ['landichoadmin@pharmadali.com', 'callowayadmin@pharmadali.com'])->delete();

        $pharmacyAdmins = [
            [
                'email'         => 'jamesmercado2209@gmail.com',
                'first_name'    => 'James',
                'last_name'     => 'Mercado',
                'mobile_number' => '09172223344',
                'address'       => 'Tanauan City, Batangas',
                'pharmacy_id'   => 1, // Puremed Pharmacy
            ],
            [
                'email'         => 'altheamishkaalvarez@gmail.com',
                'first_name'    => 'Althea Mishka',
                'last_name'     => 'Alvarez',
                'mobile_number' => '09172223345',
                'address'       => 'Tanauan City, Batangas',
                'pharmacy_id'   => 2, // Landicho Drugstore
            ],
            [
                'email'         => 'orlanesjamespatrick@gmail.com',
                'first_name'    => 'James Patrick',
                'last_name'     => 'Orlanes',
                'mobile_number' => '09172223346',
                'address'       => 'Tanauan City, Batangas',
                'pharmacy_id'   => 3, // Calloway Pharmacy
            ],
        ];

        foreach ($pharmacyAdmins as $adminData) {
            $pharmacyAdmin = User::updateOrCreate(
                ['email' => $adminData['email']],
                [
                    'first_name'    => $adminData['first_name'],
                    'last_name'     => $adminData['last_name'],
                    'password'      => Hash::make('password1234'),
                    'role'          => 'pharmacy_admin',
                    'mobile_number' => $adminData['mobile_number'],
                    'address'       => $adminData['address'],
                    'pharmacy_id'   => $adminData['pharmacy_id'],
                    'is_active'     => true,
                ]
            );
            $this->command?->info("Pharmacy Admin (Pharmacy #{$adminData['pharmacy_id']}) created: {$pharmacyAdmin->first_name} {$pharmacyAdmin->last_name} ({$pharmacyAdmin->email})");
        }

        // 3. Pharmacists (Across all pharmacies)
        User::whereIn('email', ['landichopharmacist@pharmadali.com', 'callowaypharmacist@pharmadali.com'])->delete();

        $tempPassword = 'PharmaDali#2026';

        $pharmacists = [
            [
                'email'                    => 'pharmadalipharmacist@gmail.com',
                'first_name'               => 'Angelo',
                'last_name'                => 'Reyes',
                'password'                 => $tempPassword,
                'mobile_number'            => '09173334455',
                'address'                  => 'Tanauan City, Batangas',
                'pharmacy_id'              => 1,
                'license_number'           => 'PRC-0123456',
                'requires_password_change' => true,
                'send_welcome_email'       => true,
            ],
            [
                'email'                    => 'pharmacist1@gmail.com',
                'first_name'               => 'Camille',
                'last_name'                => 'Santos',
                'password'                 => 'password1234',
                'mobile_number'            => '09173334456',
                'address'                  => 'Tanauan City, Batangas',
                'pharmacy_id'              => 1,
                'license_number'           => 'PRC-0234561',
                'requires_password_change' => false,
                'send_welcome_email'       => false,
            ],
            [
                'email'                    => 'pharmacist2@gmail.com',
                'first_name'               => 'Marco',
                'last_name'                => 'Villanueva',
                'password'                 => 'password1234',
                'mobile_number'            => '09173334457',
                'address'                  => 'Tanauan City, Batangas',
                'pharmacy_id'              => 2,
                'license_number'           => 'PRC-0234562',
                'requires_password_change' => false,
                'send_welcome_email'       => false,
            ],
            [
                'email'                    => 'pharmacist3@gmail.com',
                'first_name'               => 'Patricia',
                'last_name'                => 'Mendoza',
                'password'                 => 'password1234',
                'mobile_number'            => '09173334458',
                'address'                  => 'Tanauan City, Batangas',
                'pharmacy_id'              => 3,
                'license_number'           => 'PRC-0345678',
                'requires_password_change' => false,
                'send_welcome_email'       => false,
            ],
        ];

        foreach ($pharmacists as $pData) {
            $pharmacistUser = User::updateOrCreate(
                ['email' => $pData['email']],
                [
                    'first_name'               => $pData['first_name'],
                    'last_name'                => $pData['last_name'],
                    'password'                 => Hash::make($pData['password']),
                    'role'                     => 'pharmacist',
                    'mobile_number'            => $pData['mobile_number'],
                    'address'                  => $pData['address'],
                    'pharmacy_id'              => $pData['pharmacy_id'],
                    'is_active'                => true,
                    'requires_password_change' => $pData['requires_password_change'],
                ]
            );

            $employeeNumber = 'PHAR-' . $pharmacistUser->id . '-' . $pData['pharmacy_id'];

            // Guard against unique constraint collisions on license_number or employee_number
            $existingByLicense = Pharmacist::where('license_number', $pData['license_number'])
                ->where('user_id', '!=', $pharmacistUser->id)
                ->first();

            $licenseNumber = $existingByLicense
                ? ('PRC-' . str_pad((string) $pharmacistUser->id, 7, '0', STR_PAD_LEFT))
                : $pData['license_number'];

            Pharmacist::updateOrCreate(
                ['user_id' => $pharmacistUser->id],
                [
                    'employee_number'          => $employeeNumber,
                    'license_number'           => $licenseNumber,
                    'permissions'              => Pharmacist::DEFAULT_PERMISSIONS,
                    'requires_password_change' => $pData['requires_password_change'],
                    'is_on_duty'               => true,
                    'duty_updated_at'          => now(),
                ]
            );

            $this->command?->info("Pharmacist (Pharmacy #{$pData['pharmacy_id']}) created: {$pharmacistUser->first_name} {$pharmacistUser->last_name} ({$pharmacistUser->email}) | Emp#: {$employeeNumber}");

            if ($pData['send_welcome_email']) {
                try {
                    $pharmacistUser->notify(new PharmacistWelcomeNotification(
                        employeeNumber: $employeeNumber,
                        temporaryPassword: $pData['password']
                    ));
                    $this->command?->info("Welcome notification email sent to {$pharmacistUser->email}");
                } catch (\Throwable $e) {
                    $this->command?->warn("Could not send pharmacist welcome email: " . $e->getMessage());
                    Log::warning("Pharmacist welcome email failed during seeding: " . $e->getMessage());
                }
            }
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
