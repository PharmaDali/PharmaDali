<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Pharmacy;
use App\Models\User;
use App\Notifications\OrderExpiredNotification;
use App\Notifications\OrderPickupReminderNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class OrderExpirationTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_sends_pickup_reminder_push_notification_after_1_hour(): void
    {
        Notification::fake();

        // Freeze initial test time at 12:00
        $now = Carbon::parse('2026-07-25 12:00:00');
        Carbon::setTestNow($now);

        $pharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Central Pharmacy',
            'location'       => 'Main Street',
            'contact_number' => '09123456789',
            'is_active'      => true,
            'opening_hour'   => '08:00:00',
            'closing_hour'   => '22:00:00',
        ]);

        $user = User::factory()->create([
            'role'      => 'customer',
            'fcm_token' => 'test-fcm-token-123',
        ]);

        $customer = Customer::create([
            'user_id'       => $user->id,
            'mobile_number' => '09123456789',
        ]);

        // Scheduled pickup was 10:00 AM (2 hours ago)
        $scheduledPickup = Carbon::parse('2026-07-25 10:00:00');

        $order = Order::create([
            'order_number'            => 'ORD-1001',
            'pharmacy_id'             => $pharmacy->id,
            'customer_id'             => $customer->id,
            'status'                  => 'ready_for_pickup',
            'payment_method'          => 'cash',
            'payment_status'          => 'unpaid',
            'subtotal'                => 100.00,
            'total_amount'            => 100.00,
            'scheduled_pickup_at'     => $scheduledPickup,
            'pickup_reminder_sent_at' => null,
        ]);

        // Advance time to 14:00 (4 hours after scheduled pickup, 2 hours after creation)
        Carbon::setTestNow(Carbon::parse('2026-07-25 14:00:00'));

        $this->artisan('orders:expire')
            ->assertExitCode(0);

        $freshOrder = Order::withoutGlobalScopes()->find($order->id);
        $this->assertNotNull($freshOrder->pickup_reminder_sent_at);

        Notification::assertSentTo(
            $user,
            OrderPickupReminderNotification::class
        );
    }

    public function test_expires_unfulfilled_and_unclaimed_pickup_orders_when_pharmacy_closed(): void
    {
        Notification::fake();

        // Set test time to 14:00 when pharmacy is open
        Carbon::setTestNow(Carbon::parse('2026-07-25 14:00:00'));

        $pharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Central Pharmacy',
            'location'       => 'Main Street',
            'contact_number' => '09123456789',
            'is_active'      => true,
            'opening_hour'   => '08:00:00',
            'closing_hour'   => '18:00:00',
        ]);

        $user = User::factory()->create([
            'role' => 'customer',
        ]);

        $customer = Customer::create([
            'user_id'       => $user->id,
            'mobile_number' => '09123456789',
        ]);

        $openOrder = Order::create([
            'order_number'   => 'ORD-1002',
            'pharmacy_id'    => $pharmacy->id,
            'customer_id'    => $customer->id,
            'status'         => 'preparing',
            'payment_method' => 'cash',
            'payment_status' => 'unpaid',
            'subtotal'       => 50.00,
            'total_amount'   => 50.00,
        ]);

        $readyOrder = Order::create([
            'order_number'   => 'ORD-1003',
            'pharmacy_id'    => $pharmacy->id,
            'customer_id'    => $customer->id,
            'status'         => 'ready_for_pickup',
            'payment_method' => 'cash',
            'payment_status' => 'unpaid',
            'subtotal'       => 75.00,
            'total_amount'   => 75.00,
        ]);

        // Advance current time past closing hour (19:00)
        Carbon::setTestNow(Carbon::parse('2026-07-25 19:00:00'));

        $this->artisan('orders:expire')
            ->assertExitCode(0);

        $freshOpenOrder = Order::withoutGlobalScopes()->find($openOrder->id);
        $freshReadyOrder = Order::withoutGlobalScopes()->find($readyOrder->id);

        $this->assertEquals('overdue', $freshOpenOrder->status);
        $this->assertEquals('overdue', $freshReadyOrder->status);
        $this->assertStringContainsString('not picked up', $freshReadyOrder->cancellation_reason);

        Notification::assertSentTo(
            $user,
            OrderExpiredNotification::class
        );
    }

    public function test_orders_placed_after_closing_hour_are_not_expired_immediately(): void
    {
        Notification::fake();

        $pharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Central Pharmacy',
            'location'       => 'Main Street',
            'contact_number' => '09123456789',
            'is_active'      => true,
            'opening_hour'   => '08:00:00',
            'closing_hour'   => '18:00:00',
        ]);

        $user = User::factory()->create(['role' => 'customer']);
        $customer = Customer::create(['user_id' => $user->id, 'mobile_number' => '09123456789']);

        // Set current time to 19:00 (after 18:00 closing hour)
        Carbon::setTestNow(Carbon::parse('2026-07-25 19:00:00'));

        // Customer places an order at 19:00 (after closing)
        $lateOrder = Order::create([
            'order_number'   => 'ORD-LATE-1',
            'pharmacy_id'    => $pharmacy->id,
            'customer_id'    => $customer->id,
            'status'         => 'pending',
            'payment_method' => 'cash',
            'payment_status' => 'unpaid',
            'subtotal'       => 50.00,
            'total_amount'   => 50.00,
        ]);

        // Run the expire command at 19:01
        Carbon::setTestNow(Carbon::parse('2026-07-25 19:01:00'));
        $this->artisan('orders:expire')->assertExitCode(0);

        // Verify order remains pending and is NOT marked overdue
        $freshOrder = Order::withoutGlobalScopes()->find($lateOrder->id);
        $this->assertEquals('pending', $freshOrder->status);
    }
}
