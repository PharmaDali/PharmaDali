<?php

namespace Tests\Feature\Messaging;

use App\Models\Branch;
use App\Models\Conversation;
use App\Models\Customer;
use App\Models\Pharmacist;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    public function test_customer_can_start_a_branch_scoped_conversation_and_reuse_it(): void
    {
        $this->prepareSchema();

        $branch = Branch::create([
            'branch_name' => 'Main Branch',
            'location' => '123 Test Street',
            'contact_number' => '09123456789',
            'is_active' => true,
        ]);

        $customerUser = User::create([
            'first_name' => 'Customer',
            'last_name' => 'One',
            'email' => 'customer@example.com',
            'password' => 'password',
            'role' => 'customer',
            'mobile_number' => '09000000001',
            'branch_id' => null,
            'is_active' => true,
        ]);

        Customer::create([
            'user_id' => $customerUser->id,
            'branch_id' => null,
        ]);

        $pharmacistUser = User::create([
            'first_name' => 'Pharmacist',
            'last_name' => 'One',
            'email' => 'pharmacist@example.com',
            'password' => 'password',
            'role' => 'pharmacist',
            'mobile_number' => '09000000002',
            'branch_id' => $branch->id,
            'is_active' => true,
        ]);

        Pharmacist::create([
            'user_id' => $pharmacistUser->id,
            'employee_number' => 'EMP-001',
            'license_number' => 'LIC-001',
        ]);

        Sanctum::actingAs($customerUser, ['customer']);

        $firstResponse = $this->postJson('/api/customer/messages/conversations', [
            'counterpart_user_id' => $pharmacistUser->id,
        ]);

        $firstResponse->assertCreated();
        $this->assertDatabaseHas('customers', [
            'user_id' => $customerUser->id,
            'branch_id' => $branch->id,
        ]);
        $this->assertDatabaseHas('conversations', [
            'customer_user_id' => $customerUser->id,
            'pharmacist_user_id' => $pharmacistUser->id,
            'branch_id' => $branch->id,
        ]);

        $secondResponse = $this->postJson('/api/customer/messages/conversations', [
            'counterpart_user_id' => $pharmacistUser->id,
        ]);

        $secondResponse->assertCreated();
        $this->assertSame(1, Conversation::count());
    }

    public function test_customer_cannot_start_a_conversation_with_a_pharmacist_from_another_branch(): void
    {
        $this->prepareSchema();

        $branchA = Branch::create([
            'branch_name' => 'Branch A',
            'location' => 'A Street',
            'contact_number' => '09111111111',
            'is_active' => true,
        ]);

        $branchB = Branch::create([
            'branch_name' => 'Branch B',
            'location' => 'B Street',
            'contact_number' => '09222222222',
            'is_active' => true,
        ]);

        $customerUser = User::create([
            'first_name' => 'Customer',
            'last_name' => 'Two',
            'email' => 'customer2@example.com',
            'password' => 'password',
            'role' => 'customer',
            'mobile_number' => '09000000003',
            'branch_id' => $branchA->id,
            'is_active' => true,
        ]);

        Customer::create([
            'user_id' => $customerUser->id,
            'branch_id' => $branchA->id,
        ]);

        $pharmacistUser = User::create([
            'first_name' => 'Pharmacist',
            'last_name' => 'Two',
            'email' => 'pharmacist2@example.com',
            'password' => 'password',
            'role' => 'pharmacist',
            'mobile_number' => '09000000004',
            'branch_id' => $branchB->id,
            'is_active' => true,
        ]);

        Pharmacist::create([
            'user_id' => $pharmacistUser->id,
            'employee_number' => 'EMP-002',
            'license_number' => 'LIC-002',
        ]);

        Sanctum::actingAs($customerUser, ['customer']);

        $response = $this->postJson('/api/customer/messages/conversations', [
            'counterpart_user_id' => $pharmacistUser->id,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('conversations', 0);
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->prepareSchema();
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('conversation_messages');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('pharmacists');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('users');
        Schema::dropIfExists('branches');

        parent::tearDown();
    }

    private function prepareSchema(): void
    {
        if (!Schema::hasTable('branches')) {
            Schema::create('branches', function (Blueprint $table) {
                $table->id();
                $table->string('branch_name');
                $table->string('location');
                $table->string('contact_number');
                $table->boolean('is_active')->default(true);
                $table->softDeletes();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('first_name');
                $table->string('last_name');
                $table->string('email')->unique();
                $table->string('password');
                $table->string('role');
                $table->unsignedBigInteger('branch_id')->nullable();
                $table->boolean('is_active')->default(true);
                $table->string('mobile_number');
                $table->date('date_of_birth')->nullable();
                $table->string('address')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('customers')) {
            Schema::create('customers', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('branch_id')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('pharmacists')) {
            Schema::create('pharmacists', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('employee_number');
                $table->string('license_number')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('conversations')) {
            Schema::create('conversations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('branch_id');
                $table->unsignedBigInteger('customer_user_id');
                $table->unsignedBigInteger('pharmacist_user_id');
                $table->timestamp('last_message_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('conversation_messages')) {
            Schema::create('conversation_messages', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('conversation_id');
                $table->unsignedBigInteger('sender_user_id');
                $table->text('body');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }
    }
}