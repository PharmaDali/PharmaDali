<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Branch;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Branch::create([
            'branch_name' => 'Main Branch',
            'location' => '123 Tinurik, Tanauan City, Batangas',
            'contact_number' => '09987654321',
            'is_active' => true
        ]);
    }
}
