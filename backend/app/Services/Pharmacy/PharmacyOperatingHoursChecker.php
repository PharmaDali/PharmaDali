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

        if (!$pharmacy?->opening_hour || !$pharmacy?->closing_hour) {
            $reason = "The pharmacy operating hours are not configured. Orders and exchanges cannot be processed at this time.";
            return false;
        }

        $openingStr = Carbon::parse($pharmacy->opening_hour)->format('g:i A');
        $closingStr = Carbon::parse($pharmacy->closing_hour)->format('g:i A');

        $currentMinutes = ($nowPht->hour * 60) + $nowPht->minute;
        $openingMinutes = $this->timeToMinutes($pharmacy->opening_hour);
        $closingMinutes = $this->timeToMinutes($pharmacy->closing_hour);

        if ($closingMinutes === 0) {
            $closingMinutes = 1440;
        }

        $isOpenNow = false;
        if ($openingMinutes < $closingMinutes) {
            $isOpenNow = $currentMinutes >= $openingMinutes && $currentMinutes <= $closingMinutes;
        } else if ($openingMinutes > $closingMinutes) {
            $isOpenNow = $currentMinutes >= $openingMinutes || $currentMinutes <= $closingMinutes;
        }

        if ($windowDays === 1) {
            $isWithin24Hours = $orderCarbon->diffInHours($nowPht) <= 24;
            if (!$isSameCalendarDay && !$isWithin24Hours) {
                $reason = "Item exchange is only allowed on the same day of purchase or within 24 hours during store operating hours ({$openingStr} - {$closingStr}) per pharmacy policy.";
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
     * Check if a scheduled pickup datetime is valid based on store operating hours.
     * Allows scheduling for today (if store hours remain) or tomorrow within store hours.
     */
    public function isScheduledPickupEligible(?Pharmacy $pharmacy, Carbon|string|null $scheduledPickupAt, ?string &$reason = null): bool
    {
        if (!$pharmacy) {
            $reason = "Pharmacy not found.";
            return false;
        }

        if (!$pharmacy->is_active) {
            $reason = "This pharmacy is temporarily inactive and cannot accept orders at this time.";
            return false;
        }

        if (!$pharmacy->opening_hour || !$pharmacy->closing_hour) {
            $reason = "The pharmacy operating hours are not configured. Orders cannot be processed at this time.";
            return false;
        }

        if (!$scheduledPickupAt) {
            $reason = "Please select a scheduled pickup time.";
            return false;
        }

        $nowPht = now('Asia/Manila');

        try {
            $scheduledCarbon = Carbon::parse($scheduledPickupAt)->setTimezone('Asia/Manila');
        } catch (\Throwable) {
            $reason = "Invalid scheduled pickup date/time provided.";
            return false;
        }

        if ($scheduledCarbon->isPast()) {
            $reason = "Scheduled pickup time cannot be in the past.";
            return false;
        }

        $todayStr = $nowPht->format('Y-m-d');
        $tomorrowStr = $nowPht->copy()->addDay()->format('Y-m-d');
        $pickupDateStr = $scheduledCarbon->format('Y-m-d');

        if ($pickupDateStr !== $todayStr && $pickupDateStr !== $tomorrowStr) {
            $reason = "Pickup can only be scheduled for today or tomorrow.";
            return false;
        }

        $openingStr = Carbon::parse($pharmacy->opening_hour)->format('g:i A');
        $closingStr = Carbon::parse($pharmacy->closing_hour)->format('g:i A');

        $openingMinutes = $this->timeToMinutes($pharmacy->opening_hour);
        $closingMinutes = $this->timeToMinutes($pharmacy->closing_hour);
        if ($closingMinutes === 0) {
            $closingMinutes = 1440;
        }

        $pickupMinutes = ($scheduledCarbon->hour * 60) + $scheduledCarbon->minute;

        if ($pickupDateStr === $todayStr) {
            // Must be at least 30 minutes in advance
            if ($scheduledCarbon->lt($nowPht->copy()->addMinutes(30))) {
                $reason = "Pickup time for today must be at least 30 minutes in advance.";
                return false;
            }

            if (!$this->isTimeWithinOperatingMinutes($pickupMinutes, $openingMinutes, $closingMinutes)) {
                $reason = "Selected pickup time for today is outside store operating hours ({$openingStr} - {$closingStr}).";
                return false;
            }
        } elseif ($pickupDateStr === $tomorrowStr) {
            if (!$this->isTimeWithinOperatingMinutes($pickupMinutes, $openingMinutes, $closingMinutes)) {
                $reason = "Selected pickup time for tomorrow is outside store operating hours ({$openingStr} - {$closingStr}).";
                return false;
            }
        }

        return true;
    }

    /**
     * Check if a minute of the day falls within open-close minute bounds.
     */
    public function isTimeWithinOperatingMinutes(int $minutes, int $openMin, int $closeMin): bool
    {
        if ($openMin < $closeMin) {
            return $minutes >= $openMin && $minutes <= $closeMin;
        } elseif ($openMin > $closeMin) {
            return $minutes >= $openMin || $minutes <= $closeMin;
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
