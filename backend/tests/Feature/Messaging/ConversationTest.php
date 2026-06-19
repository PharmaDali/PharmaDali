<?php

namespace Tests\Feature\Messaging;

use App\Models\Pharmacy;
use App\Models\Conversation;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    public function test_customer_can_start_a_pharmacy_scoped_conversation_and_reuse_it(): void
    {
        $this->prepareSchema();

        $pharmacy = Pharmacy::create([
            'pharmacy_name' => 'Main Pharmacy',
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
            'pharmacy_id' => null,
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'user_id' => $customerUser->id,
            'pharmacy_id' => null,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-0001',
            'customer_id' => $customer->id,
            'pharmacy_id' => $pharmacy->id,
            'status' => 'pending',
            'payment_method' => 'cod',
            'payment_status' => 'unpaid',
            'subtotal' => 100,
            'discount_amount' => 0,
            'total_amount' => 100,
            'placed_at' => now(),
        ]);

        Sanctum::actingAs($customerUser, ['customer']);

        $firstResponse = $this->postJson('/api/customer/messages/conversations', [
            'order_id' => $order->id,
        ]);

        $firstResponse->assertCreated();
        $this->assertDatabaseHas('conversations', [
            'order_id' => $order->id,
            'customer_user_id' => $customerUser->id,
            'pharmacy_id' => $pharmacy->id,
            'status' => 'open',
        ]);

        $secondResponse = $this->postJson('/api/customer/messages/conversations', [
            'order_id' => $order->id,
        ]);

        $secondResponse->assertCreated();
        $this->assertSame(1, Conversation::count());
    }

    public function test_customer_cannot_start_a_conversation_for_another_customers_order(): void
    {
        $this->prepareSchema();

        $pharmacyA = Pharmacy::create([
            'pharmacy_name' => 'Pharmacy A',
            'location' => 'A Street',
            'contact_number' => '09111111111',
            'is_active' => true,
        ]);

        $pharmacyB = Pharmacy::create([
            'pharmacy_name' => 'Pharmacy B',
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
            'pharmacy_id' => $pharmacyA->id,
            'is_active' => true,
        ]);

        Customer::create([
            'user_id' => $customerUser->id,
            'pharmacy_id' => $pharmacyA->id,
        ]);

        $otherCustomerUser = User::create([
            'first_name' => 'Customer',
            'last_name' => 'Three',
            'email' => 'customer3@example.com',
            'password' => 'password',
            'role' => 'customer',
            'mobile_number' => '09000000004',
            'pharmacy_id' => $pharmacyB->id,
            'is_active' => true,
        ]);

        $otherCustomer = Customer::create([
            'user_id' => $otherCustomerUser->id,
            'pharmacy_id' => $pharmacyB->id,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-0002',
            'customer_id' => $otherCustomer->id,
            'pharmacy_id' => $pharmacyB->id,
            'status' => 'pending',
            'payment_method' => 'cod',
            'payment_status' => 'unpaid',
            'subtotal' => 80,
            'discount_amount' => 0,
            'total_amount' => 80,
            'placed_at' => now(),
        ]);

        Sanctum::actingAs($customerUser, ['customer']);

        $response = $this->postJson('/api/customer/messages/conversations', [
            'order_id' => $order->id,
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
        Schema::dropIfExists('pharmacies');

        parent::tearDown();
    }

    private function prepareSchema(): void
    {
        if (!Schema::hasTable('pharmacies')) {
            Schema::create('pharmacies', function (Blueprint $table) {
                $table->id();
                $table->string('pharmacy_name');
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
                $table->unsignedBigInteger('pharmacy_id')->nullable();
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
                $table->unsignedBigInteger('pharmacy_id')->nullable();
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

        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->id();
                $table->string('order_number')->unique();
                $table->unsignedBigInteger('customer_id');
                $table->unsignedBigInteger('pharmacy_id');
                $table->string('status');
                $table->string('payment_method');
                $table->string('payment_status');
                $table->decimal('subtotal', 10, 2)->default(0);
                $table->decimal('discount_amount', 10, 2)->default(0);
                $table->decimal('total_amount', 10, 2)->default(0);
                $table->timestamp('placed_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('conversations')) {
            Schema::create('conversations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('order_id')->unique();
                $table->unsignedBigInteger('pharmacy_id');
                $table->unsignedBigInteger('customer_user_id');
                $table->unsignedBigInteger('assigned_pharmacist_user_id')->nullable();
                $table->string('status')->default('open');
                $table->timestamp('closed_at')->nullable();
                $table->timestamp('last_message_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('conversation_participants')) {
            Schema::create('conversation_participants', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('conversation_id');
                $table->unsignedBigInteger('user_id');
                $table->string('participant_role');
                $table->timestamp('joined_at')->nullable();
                $table->timestamp('left_at')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('conversation_assignments')) {
            Schema::create('conversation_assignments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('conversation_id');
                $table->unsignedBigInteger('pharmacist_user_id');
                $table->unsignedBigInteger('assigned_by_user_id')->nullable();
                $table->timestamp('assigned_at')->nullable();
                $table->timestamp('released_at')->nullable();
                $table->boolean('is_current')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('conversation_messages')) {
            Schema::create('conversation_messages', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('conversation_id');
                $table->unsignedBigInteger('sender_user_id')->nullable();
                $table->string('message_type')->default('user');
                $table->string('visibility')->default('public');
                $table->text('body');
                $table->json('metadata')->nullable();
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }
    }
}