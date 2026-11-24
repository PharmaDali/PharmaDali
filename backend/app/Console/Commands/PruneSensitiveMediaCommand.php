<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Models\ConversationMessage;
use App\Models\Order;
use App\Models\OrderItemPrescription;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PruneSensitiveMediaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:prune-sensitive-files
        {--dry-run : Simulate retention pruning without deleting files or updating database records}
        {--force-days= : Override all retention windows in days (e.g. 0 for immediate testing/demo)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically purge expired sensitive customer media (discount IDs, prescriptions, payment receipts, chat images) per Data Privacy & FDA retention policies';

    /**
     * Terminal order statuses eligible for retention countdown.
     */
    private const TERMINAL_ORDER_STATUSES = [
        OrderStatus::COMPLETED,
        OrderStatus::CANCELLED,
        OrderStatus::OVERDUE,
    ];

    public function handle(): int
    {
        $isDryRun = (bool) $this->option('dry-run');
        $now = Carbon::now();

        $discountCompletedDays   = $this->resolveRetentionDays('discount_id_completed_days', 7);
        $discountUnfulfilledDays = $this->resolveRetentionDays('discount_id_unfulfilled_days', 3);
        $rxDispensedDays         = $this->resolveRetentionDays('prescription_dispensed_days', 730);
        $rxUnfulfilledDays       = $this->resolveRetentionDays('prescription_unfulfilled_days', 30);
        $receiptCompletedDays    = $this->resolveRetentionDays('payment_receipt_completed_days', 90);
        $receiptUnfulfilledDays  = $this->resolveRetentionDays('payment_receipt_unfulfilled_days', 30);
        $chatImageDays           = $this->resolveRetentionDays('chat_image_days', 90);

        $this->info($isDryRun
            ? '[DRY-RUN] Evaluating sensitive media against retention policy...'
            : 'Pruning expired sensitive media per retention policy...');

        $discountPruned = $this->pruneDiscountIds($now, $discountCompletedDays, $discountUnfulfilledDays, $isDryRun);
        $rxPruned       = $this->prunePrescriptions($now, $rxDispensedDays, $rxUnfulfilledDays, $isDryRun);
        $receiptPruned  = $this->prunePaymentReceipts($now, $receiptCompletedDays, $receiptUnfulfilledDays, $isDryRun);
        $chatPruned     = $this->pruneChatImages($now, $chatImageDays, $isDryRun);

        $totalPruned = $discountPruned + $rxPruned + $receiptPruned + $chatPruned;

        $this->table(
            ['Category', 'Retention Window', $isDryRun ? 'Would Purge' : 'Purged'],
            [
                ['Discount IDs', "{$discountCompletedDays}d completed / {$discountUnfulfilledDays}d unfulfilled", $discountPruned],
                ['Prescriptions', "{$rxDispensedDays}d dispensed / {$rxUnfulfilledDays}d unfulfilled", $rxPruned],
                ['Payment Receipts', "{$receiptCompletedDays}d completed / {$receiptUnfulfilledDays}d unfulfilled", $receiptPruned],
                ['Consultation Chat Images', "{$chatImageDays}d post-closure", $chatPruned],
            ]
        );

        if (!$isDryRun && $totalPruned > 0) {
            Log::info('[DataRetention] Sensitive media pruning completed.', [
                'discount_ids_purged'     => $discountPruned,
                'prescriptions_purged'    => $rxPruned,
                'payment_receipts_purged' => $receiptPruned,
                'chat_images_purged'      => $chatPruned,
                'total_purged'            => $totalPruned,
                'executed_at'             => $now->toIso8601String(),
            ]);
        }

        $this->info($isDryRun
            ? "Dry-run complete. {$totalPruned} sensitive file(s) qualify for disposal."
            : "Retention pruning complete. {$totalPruned} sensitive file(s) disposed.");

        return self::SUCCESS;
    }

    private function pruneDiscountIds(Carbon $now, int $completedDays, int $unfulfilledDays, bool $isDryRun): int
    {
        $count = 0;

        $orders = Order::withoutGlobalScopes()
            ->whereNotNull('discount_id_image_path')
            ->whereIn('status', self::TERMINAL_ORDER_STATUSES)
            ->get();

        foreach ($orders as $order) {
            $isCompleted = $order->status === OrderStatus::COMPLETED;
            $referenceTime = $isCompleted
                ? ($order->completed_at ?? $order->updated_at ?? $order->created_at)
                : ($order->cancelled_at ?? $order->updated_at ?? $order->created_at);

            $days = $isCompleted ? $completedDays : $unfulfilledDays;

            if (!$this->hasRetentionElapsed($referenceTime, $days, $now)) {
                continue;
            }

            $this->deleteFileFromDisks($order->discount_id_image_path, $isDryRun);

            if (!$isDryRun) {
                $order->discount_id_image_path = null;
                $order->discount_id_purged_at = $now;
                $order->saveQuietly();
            }

            $count++;
        }

        return $count;
    }

    private function prunePrescriptions(Carbon $now, int $dispensedDays, int $unfulfilledDays, bool $isDryRun): int
    {
        $count = 0;

        $prescriptions = OrderItemPrescription::query()
            ->whereNotNull('prescription_image_path')
            ->with([
                'orderItem' => fn ($q) => $q->withoutGlobalScopes()->with([
                    'order' => fn ($oq) => $oq->withoutGlobalScopes(),
                ]),
            ])
            ->get();

        foreach ($prescriptions as $prescription) {
            $order = $prescription->orderItem?->order;
            if (!$order || !in_array($order->status, self::TERMINAL_ORDER_STATUSES, true)) {
                continue;
            }

            $isDispensed = $order->status === OrderStatus::COMPLETED;
            $referenceTime = $isDispensed
                ? ($order->completed_at ?? $prescription->verified_at ?? $prescription->updated_at ?? $prescription->created_at)
                : ($order->cancelled_at ?? $prescription->updated_at ?? $prescription->created_at);

            $days = $isDispensed ? $dispensedDays : $unfulfilledDays;

            if (!$this->hasRetentionElapsed($referenceTime, $days, $now)) {
                continue;
            }

            $this->deleteFileFromDisks($prescription->prescription_image_path, $isDryRun);

            if (!$isDryRun) {
                $prescription->prescription_image_path = null;
                $prescription->prescription_purged_at = $now;
                $prescription->saveQuietly();
            }

            $count++;
        }

        return $count;
    }

    private function prunePaymentReceipts(Carbon $now, int $completedDays, int $unfulfilledDays, bool $isDryRun): int
    {
        $count = 0;

        $orders = Order::withoutGlobalScopes()
            ->whereNotNull('payment_receipt_image_path')
            ->whereIn('status', self::TERMINAL_ORDER_STATUSES)
            ->get();

        foreach ($orders as $order) {
            $isCompleted = $order->status === OrderStatus::COMPLETED;
            $referenceTime = $isCompleted
                ? ($order->completed_at ?? $order->updated_at ?? $order->created_at)
                : ($order->cancelled_at ?? $order->updated_at ?? $order->created_at);

            $days = $isCompleted ? $completedDays : $unfulfilledDays;

            if (!$this->hasRetentionElapsed($referenceTime, $days, $now)) {
                continue;
            }

            $this->deleteFileFromDisks($order->payment_receipt_image_path, $isDryRun);

            if (!$isDryRun) {
                $order->payment_receipt_image_path = null;
                $order->payment_receipt_purged_at = $now;
                $order->saveQuietly();
            }

            $count++;
        }

        return $count;
    }

    private function pruneChatImages(Carbon $now, int $chatImageDays, bool $isDryRun): int
    {
        $count = 0;

        $messages = ConversationMessage::query()
            ->whereNotNull('metadata')
            ->where('metadata', 'like', '%image_path%')
            ->with([
                'conversation' => fn ($q) => $q->with([
                    'order' => fn ($oq) => $oq->withoutGlobalScopes(),
                ]),
            ])
            ->get();

        foreach ($messages as $message) {
            $rawMetadata = $message->getRawOriginal('metadata');
            $metadata = is_string($rawMetadata)
                ? json_decode($rawMetadata, true)
                : (is_array($rawMetadata) ? $rawMetadata : []);

            $imagePath = $metadata['image_path'] ?? null;
            if (!$imagePath || !is_string($imagePath)) {
                continue;
            }

            $conversation = $message->conversation;
            $order = $conversation?->order;

            if ($order) {
                if (!in_array($order->status, self::TERMINAL_ORDER_STATUSES, true)) {
                    continue;
                }
                $referenceTime = $order->completed_at ?? $order->cancelled_at ?? $message->created_at;
            } else {
                if ($conversation && !in_array((string) $conversation->status, ['closed', 'resolved', 'archived'], true)) {
                    continue;
                }
                $referenceTime = $conversation?->updated_at ?? $message->created_at;
            }

            if (!$this->hasRetentionElapsed($referenceTime, $chatImageDays, $now)) {
                continue;
            }

            $this->deleteFileFromDisks($imagePath, $isDryRun);

            if (!$isDryRun) {
                $metadata['image_path'] = null;
                unset($metadata['image_url']);
                $metadata['image_purged_at'] = $now->toIso8601String();
                $message->metadata = $metadata;
                $message->saveQuietly();
            }

            $count++;
        }

        return $count;
    }

    private function resolveRetentionDays(string $configKey, int $default): int
    {
        $override = $this->option('force-days');
        if ($override !== null && $override !== '') {
            return max(0, (int) $override);
        }

        return max(0, (int) config("retention.{$configKey}", $default));
    }

    private function hasRetentionElapsed(mixed $referenceTime, int $retentionDays, Carbon $now): bool
    {
        if (!$referenceTime) {
            return false;
        }

        $parsed = $referenceTime instanceof Carbon
            ? $referenceTime
            : Carbon::parse((string) $referenceTime);

        return $parsed->lessThanOrEqualTo($now->copy()->subDays($retentionDays));
    }

    private function deleteFileFromDisks(string $path, bool $isDryRun): void
    {
        $normalizedPath = ltrim(str_replace('\\', '/', $path), '/');
        if ($normalizedPath === '') {
            return;
        }

        foreach (['local', 'public'] as $disk) {
            if (Storage::disk($disk)->exists($normalizedPath)) {
                if (!$isDryRun) {
                    Storage::disk($disk)->delete($normalizedPath);
                }
            }
        }
    }
}
