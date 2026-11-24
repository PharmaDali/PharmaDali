<?php

namespace Tests\Feature\Media;

use App\Models\Category;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemPrescription;
use App\Models\Pharmacist;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\Products;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PruneSensitiveMediaCommandTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;
    private User $pharmacistUser;
    private User $customerUser;
    private Customer $customer;
    private PharmacyProduct $pharmacyProduct;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        Storage::fake('public');

        $this->pharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Dali Retention Pharmacy',
            'location'       => 'Makati',
            'contact_number' => '09171234567',
            'is_active'      => true,
        ]);

        $this->pharmacistUser = User::factory()->create([
            'role'        => 'pharmacist',
            'pharmacy_id' => $this->pharmacy->id,
        ]);

        Pharmacist::create([
            'user_id'         => $this->pharmacistUser->id,
            'employee_number' => 'EMP-RET-001',
            'license_number'  => 'PRC-998877',
        ]);

        $this->customerUser = User::factory()->create([
            'role'        => 'customer',
            'pharmacy_id' => null,
        ]);

        $this->customer = Customer::create([
            'user_id'     => $this->customerUser->id,
            'pharmacy_id' => null,
        ]);

        $category = Category::create([
            'category_name' => 'Antibiotics',
            'is_active'     => true,
        ]);

        $product = Products::create([
            'product_name'  => 'Co-Amoxiclav 625mg',
            'brand_name'    => 'Augmentin',
            'generic_name'  => 'Co-Amoxiclav',
            'dosage'        => '625mg',
            'is_prescribed' => true,
            'image_path'    => 'products/augmentin.jpg',
        ]);

        $this->pharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'     => $this->pharmacy->id,
            'product_id'      => $product->id,
            'category_id'     => $category->id,
            'selling_price'   => 65.00,
            'stock'           => 50,
            'is_discountable' => true,
            'is_active'       => true,
        ]);
    }

    public function test_discount_id_is_purged_after_7_days_on_completed_order_while_audit_fields_remain(): void
    {
        $recentPath = 'discount_ids/1/recent_completed.webp';
        $expiredPath = 'discount_ids/1/expired_completed.webp';
        Storage::disk('local')->put($recentPath, 'recent id bytes');
        Storage::disk('local')->put($expiredPath, 'expired id bytes');

        $recentOrder = $this->createOrder('ORD-DISC-RECENT', 'completed', [
            'discount_type'          => 'senior_citizen',
            'discount_id_number'     => 'SC-1001',
            'discount_id_image_path' => $recentPath,
            'verified_by'            => $this->pharmacistUser->id,
            'verified_at'            => now()->subDays(5),
            'completed_at'           => now()->subDays(5),
        ]);

        $expiredOrder = $this->createOrder('ORD-DISC-EXPIRED', 'completed', [
            'discount_type'          => 'pwd',
            'discount_id_number'     => 'PWD-2002',
            'discount_id_image_path' => $expiredPath,
            'verified_by'            => $this->pharmacistUser->id,
            'verified_at'            => now()->subDays(8),
            'completed_at'           => now()->subDays(8),
        ]);

        $this->artisan('storage:prune-sensitive-files')
            ->assertExitCode(0);

        // Recent completed order (5 days < 7 days) keeps its file
        Storage::disk('local')->assertExists($recentPath);
        $recentOrder->refresh();
        $this->assertSame($recentPath, $recentOrder->discount_id_image_path);
        $this->assertNull($recentOrder->discount_id_purged_at);

        // Expired completed order (8 days >= 7 days) purges image but retains BIR textual metadata
        Storage::disk('local')->assertMissing($expiredPath);
        $expiredOrder->refresh();
        $this->assertNull($expiredOrder->discount_id_image_path);
        $this->assertNotNull($expiredOrder->discount_id_purged_at);
        $this->assertSame('pwd', $expiredOrder->discount_type);
        $this->assertSame('PWD-2002', $expiredOrder->discount_id_number);
        $this->assertSame($this->pharmacistUser->id, $expiredOrder->verified_by);
    }

    public function test_prescriptions_follow_2_year_fda_retention_when_dispensed_and_30_days_when_unfulfilled(): void
    {
        $dispensedOneYearPath = 'prescriptions/order-items/rx_1yr.jpg';
        $dispensedExpiredPath = 'prescriptions/order-items/rx_over_2yr.jpg';
        $cancelledExpiredPath = 'prescriptions/order-items/rx_cancelled_31d.jpg';

        Storage::disk('local')->put($dispensedOneYearPath, 'rx 1yr');
        Storage::disk('local')->put($dispensedExpiredPath, 'rx >2yr');
        Storage::disk('local')->put($cancelledExpiredPath, 'rx cancelled');

        // 1. Dispensed 1 year ago -> MUST be retained (RA 10918 requires 2 years = 730 days)
        $oneYearOrder = $this->createOrder('ORD-RX-1YR', 'completed', [
            'completed_at' => now()->subDays(365),
        ]);
        $rxOneYear = $this->attachPrescription($oneYearOrder, $dispensedOneYearPath, 'verified', now()->subDays(365));

        // 2. Dispensed 731 days ago -> MUST be purged after 2-year window lapses
        $overTwoYearsOrder = $this->createOrder('ORD-RX-2YR', 'completed', [
            'completed_at' => now()->subDays(731),
        ]);
        $rxOverTwoYears = $this->attachPrescription($overTwoYearsOrder, $dispensedExpiredPath, 'verified', now()->subDays(731));

        // 3. Cancelled 31 days ago (never dispensed) -> MUST be purged after 30-day data minimization window
        $cancelledOrder = $this->createOrder('ORD-RX-CANCELLED', 'cancelled', [
            'cancelled_at' => now()->subDays(31),
        ]);
        $rxCancelled = $this->attachPrescription($cancelledOrder, $cancelledExpiredPath, 'rejected', null);

        $this->artisan('storage:prune-sensitive-files')
            ->assertExitCode(0);

        // 1-year dispensed prescription is preserved
        Storage::disk('local')->assertExists($dispensedOneYearPath);
        $rxOneYear->refresh();
        $this->assertSame($dispensedOneYearPath, $rxOneYear->prescription_image_path);
        $this->assertNull($rxOneYear->prescription_purged_at);

        // >2-year dispensed prescription is purged while keeping pharmacist verification metadata
        Storage::disk('local')->assertMissing($dispensedExpiredPath);
        $rxOverTwoYears->refresh();
        $this->assertNull($rxOverTwoYears->prescription_image_path);
        $this->assertNotNull($rxOverTwoYears->prescription_purged_at);
        $this->assertSame($this->pharmacistUser->id, $rxOverTwoYears->verified_by);
        $this->assertFalse($rxOverTwoYears->is_reuploaded);

        // 31-day cancelled prescription is purged early
        Storage::disk('local')->assertMissing($cancelledExpiredPath);
        $rxCancelled->refresh();
        $this->assertNull($rxCancelled->prescription_image_path);
        $this->assertNotNull($rxCancelled->prescription_purged_at);
    }

    public function test_payment_receipts_and_chat_images_are_purged_only_after_terminal_retention_window(): void
    {
        $receiptPath = 'payment_receipts/1/gcash_old.webp';
        $chatPath = 'chat_images/1/symptom_old.jpg';
        $activeOrderPath = 'discount_ids/1/active_pending.webp';

        Storage::disk('local')->put($receiptPath, 'receipt bytes');
        Storage::disk('local')->put($chatPath, 'chat image bytes');
        Storage::disk('local')->put($activeOrderPath, 'active order id bytes');

        $completedOrder = $this->createOrder('ORD-RECEIPT-CHAT', 'completed', [
            'payment_receipt_image_path' => $receiptPath,
            'completed_at'               => now()->subDays(91),
        ]);

        $conversation = Conversation::create([
            'order_id'         => $completedOrder->id,
            'customer_user_id' => $this->customerUser->id,
            'pharmacy_id'      => $this->pharmacy->id,
            'status'           => 'closed',
        ]);

        $message = ConversationMessage::create([
            'conversation_id' => $conversation->id,
            'sender_user_id'  => $this->customerUser->id,
            'message_type'    => 'image',
            'visibility'      => 'public',
            'body'            => 'Attached photo for consultation',
            'metadata'        => ['image_path' => $chatPath],
        ]);

        // Active (pending) order must NEVER be pruned even if old
        $activeOrder = $this->createOrder('ORD-ACTIVE-SAFE', 'pending', [
            'discount_id_image_path' => $activeOrderPath,
        ]);

        // Dry run should NOT delete anything
        $this->artisan('storage:prune-sensitive-files --dry-run')
            ->assertExitCode(0);

        Storage::disk('local')->assertExists($receiptPath);
        Storage::disk('local')->assertExists($chatPath);

        // Live run deletes expired terminal media while leaving active order untouched
        $this->artisan('storage:prune-sensitive-files')
            ->assertExitCode(0);

        Storage::disk('local')->assertMissing($receiptPath);
        Storage::disk('local')->assertMissing($chatPath);
        Storage::disk('local')->assertExists($activeOrderPath);

        $completedOrder->refresh();
        $this->assertNull($completedOrder->payment_receipt_image_path);
        $this->assertNotNull($completedOrder->payment_receipt_purged_at);

        $message->refresh();
        $this->assertNull($message->metadata['image_path'] ?? null);
        $this->assertNotEmpty($message->metadata['image_purged_at'] ?? null);
        $this->assertSame('Attached photo for consultation', $message->body);

        $activeOrder->refresh();
        $this->assertSame($activeOrderPath, $activeOrder->discount_id_image_path);
    }

    public function test_force_days_zero_immediately_prunes_terminal_orders_for_demo_while_protecting_active_orders(): void
    {
        $terminalPath = 'discount_ids/1/just_completed.webp';
        $activePath = 'discount_ids/1/still_reviewing.webp';
        Storage::disk('local')->put($terminalPath, 'done');
        Storage::disk('local')->put($activePath, 'active');

        $completedOrder = $this->createOrder('ORD-DEMO-NOW', 'completed', [
            'discount_id_image_path' => $terminalPath,
            'completed_at'           => now()->subMinute(),
        ]);

        $reviewingOrder = $this->createOrder('ORD-DEMO-ACTIVE', 'reviewing', [
            'discount_id_image_path' => $activePath,
        ]);

        $this->artisan('storage:prune-sensitive-files --force-days=0')
            ->assertExitCode(0);

        Storage::disk('local')->assertMissing($terminalPath);
        Storage::disk('local')->assertExists($activePath);

        $completedOrder->refresh();
        $this->assertNotNull($completedOrder->discount_id_purged_at);

        $reviewingOrder->refresh();
        $this->assertSame($activePath, $reviewingOrder->discount_id_image_path);
    }

    private function createOrder(string $orderNumber, string $status, array $overrides = []): Order
    {
        return Order::create(array_merge([
            'order_number'   => $orderNumber,
            'pharmacy_id'    => $this->pharmacy->id,
            'customer_id'    => $this->customer->id,
            'status'         => $status,
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'subtotal'       => 130.00,
            'total_amount'   => 130.00,
            'placed_at'      => now()->subDays(10),
        ], $overrides));
    }

    private function attachPrescription(Order $order, string $path, string $status, mixed $verifiedAt): OrderItemPrescription
    {
        $item = OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $this->pharmacyProduct->id,
            'product_name'        => 'Co-Amoxiclav 625mg',
            'quantity'            => 2,
            'unit_price_snapshot' => 65.00,
            'line_total'          => 130.00,
        ]);

        return OrderItemPrescription::create([
            'order_item_id'           => $item->id,
            'prescription_image_path' => $path,
            'status'                  => $status,
            'verified_by'             => $verifiedAt ? $this->pharmacistUser->id : null,
            'verified_at'             => $verifiedAt,
        ]);
    }
}
