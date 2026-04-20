<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Branch::updateOrCreate(
            ['branch_name' => 'Main Branch'],
            [
                'location' => '123 Tinurik, Tanauan City, Batangas',
                'contact_number' => '09987654321',
                'opening_hour' => '09:00:00',
                'closing_hour' => '21:00:00',
                'is_active' => true,
            ]
        );
    }
}
