<?php

namespace App\Services\Pharmacy;

use App\Models\Pharmacy;
use App\Models\Order;
use Carbon\Carbon;

class PharmacyOperatingHoursChecker
{
    /**
     * Check if an order is eligible for exchange based on operating hours and return window.
     */
    public function isOrderEligibleWithinHours(?Pharmacy $pharmacy, Order $order, int $windowDays, ?string &$reason = null): bool
    {
        $nowPht = now('Asia/Manila');
        $orderDate = $order->completed_at ?? $order->placed_at ?? $order->created_at;
        $orderCarbon = $orderDate ? Carbon::parse($orderDate)->setTimezone('Asia/Manila') : $nowPht;
        $isSameCalendarDay = $orderCarbon->format('Y-m-d') === $nowPht->format('Y-m-d');

        $isOpenNow = true;
        $openingStr = '12:00 AM';
        $closingStr = '11:59 PM';

        if ($pharmacy?->opening_hour && $pharmacy?->closing_hour) {
            $openingStr = Carbon::parse($pharmacy->opening_hour)->format('g:i A');
            $closingStr = Carbon::parse($pharmacy->closing_hour)->format('g:i A');

            $currentMinutes = ($nowPht->hour * 60) + $nowPht->minute;
            $openingMinutes = $this->timeToMinutes($pharmacy->opening_hour);
            $closingMinutes = $this->timeToMinutes($pharmacy->closing_hour);

            if ($closingMinutes === 0) {
                $closingMinutes = 1440;
            }

            if ($openingMinutes < $closingMinutes) {
                $isOpenNow = $currentMinutes >= $openingMinutes && $currentMinutes <= $closingMinutes;
            } else if ($openingMinutes > $closingMinutes) {
                $isOpenNow = $currentMinutes >= $openingMinutes || $currentMinutes <= $closingMinutes;
            }
        }

        if ($windowDays === 1) {
            if (!$isSameCalendarDay) {
                $reason = "Item exchange is only allowed on the same day of purchase during store operating hours ({$openingStr} - {$closingStr}) per pharmacy policy.";
                return false;
            }

            if (!$isOpenNow) {
                $reason = "Item exchange can only be processed during pharmacy operating hours ({$openingStr} - {$closingStr}).";
                return false;
            }
        } else {
            $daysDiff = $orderCarbon->diffInDays($nowPht);
            if ($daysDiff > $windowDays) {
                $reason = "Item exchange is only allowed within {$windowDays} days of purchase.";
                return false;
            }
        }

        return true;
    }

    /**
     * Convert H:i / H:i:s time string to minutes from midnight.
     */
    public function timeToMinutes($time): int
    {
        if (!$time) return 0;
        if (is_numeric($time)) return (int) $time;
        try {
            $c = Carbon::parse($time);
            return ($c->hour * 60) + $c->minute;
        } catch (\Throwable $e) {
            return 0;
        }
    }
}
