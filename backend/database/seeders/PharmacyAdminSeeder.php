<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Pharmacist;
use Illuminate\Support\Facades\Hash;

class PharmacyAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::whereIn('email', ['landichoadmin@pharmadali.com', 'callowayadmin@pharmadali.com'])->delete();

        $admins = [
            [
                'email'         => 'jamesmercado2209@gmail.com',
                'first_name'    => 'James',
                'last_name'     => 'Mercado',
                'mobile_number' => '09172223344',
                'pharmacy_id'   => 1,
            ],
            [
                'email'         => 'altheamishkaalvarez@gmail.com',
                'first_name'    => 'Althea Mishka',
                'last_name'     => 'Alvarez',
                'mobile_number' => '09172223345',
                'pharmacy_id'   => 2,
            ],
            [
                'email'         => 'orlanesjamespatrick@gmail.com',
                'first_name'    => 'James Patrick',
                'last_name'     => 'Orlanes',
                'mobile_number' => '09172223346',
                'pharmacy_id'   => 3,
            ],
        ];

        foreach ($admins as $adminData) {
            User::updateOrCreate(
                ['email' => $adminData['email']],
                [
                    'first_name'    => $adminData['first_name'],
                    'last_name'     => $adminData['last_name'],
                    'password'      => Hash::make('password1234'),
                    'role'          => 'pharmacy_admin',
                    'mobile_number' => $adminData['mobile_number'],
                    'is_active'     => true,
                    'pharmacy_id'   => $adminData['pharmacy_id'],
                ]
            );
        }

        User::whereIn('email', ['landichopharmacist@pharmadali.com', 'callowaypharmacist@pharmadali.com'])->delete();

        $pharmacists = [
            [
                'email'          => 'pharmacist1@gmail.com',
                'first_name'     => 'Camille',
                'last_name'      => 'Santos',
                'mobile_number'  => '09173334456',
                'pharmacy_id'    => 1,
                'license_number' => 'PRC-0234561',
            ],
            [
                'email'          => 'pharmacist2@gmail.com',
                'first_name'     => 'Marco',
                'last_name'      => 'Villanueva',
                'mobile_number'  => '09173334457',
                'pharmacy_id'    => 2,
                'license_number' => 'PRC-0234562',
            ],
            [
                'email'          => 'pharmacist3@gmail.com',
                'first_name'     => 'Patricia',
                'last_name'      => 'Mendoza',
                'mobile_number'  => '09173334458',
                'pharmacy_id'    => 3,
                'license_number' => 'PRC-0345678',
            ],
        ];

        foreach ($pharmacists as $pData) {
            $pharmacistUser = User::updateOrCreate(
                ['email' => $pData['email']],
                [
                    'first_name'               => $pData['first_name'],
                    'last_name'                => $pData['last_name'],
                    'password'                 => Hash::make('password1234'),
                    'role'                     => 'pharmacist',
                    'mobile_number'            => $pData['mobile_number'],
                    'is_active'                => true,
                    'pharmacy_id'              => $pData['pharmacy_id'],
                    'requires_password_change' => false,
                ]
            );

            $existingByLicense = Pharmacist::where('license_number', $pData['license_number'])
                ->where('user_id', '!=', $pharmacistUser->id)
                ->first();

            $licenseNumber = $existingByLicense
                ? ('PRC-' . str_pad((string) $pharmacistUser->id, 7, '0', STR_PAD_LEFT))
                : $pData['license_number'];

            $employeeNumber = 'PHAR-' . $pharmacistUser->id . '-' . $pData['pharmacy_id'];

            Pharmacist::updateOrCreate(
                ['user_id' => $pharmacistUser->id],
                [
                    'employee_number'          => $employeeNumber,
                    'license_number'           => $licenseNumber,
                    'permissions'              => Pharmacist::DEFAULT_PERMISSIONS,
                    'requires_password_change' => false,
                    'is_on_duty'               => true,
                    'duty_updated_at'          => now(),
                ]
            );
        }
    }
}
