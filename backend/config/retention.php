<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sensitive Media Retention Policy (Days)
    |--------------------------------------------------------------------------
    |
    | Tiered data retention windows aligned with Philippine regulatory mandates:
    |
    | 1. Discount ID Images (Senior Citizen / PWD IDs):
    |    Classified as Sensitive Personal Information (SPI) under RA 10173
    |    (Data Privacy Act of 2012, Sec. 3l) and NPC proportionality guidelines.
    |    Images are collected solely to verify remote eligibility; once an order
    |    reaches a terminal state, only textual audit metadata (discount_type,
    |    discount_id_number, verified_by, verified_at) is retained for BIR
    |    compliance under RA 9994 / RA 10754 while the ID photo is purged.
    |
    | 2. Prescription Images:
    |    Dispensed prescriptions must be retained on file for a minimum of
    |    2 years (730 days) for FDA / pharmacist inspection under RA 10918
    |    (Philippine Pharmacy Act). Unfulfilled prescriptions (cancelled or
    |    overdue orders where no medicine was dispensed) are purged after
    |    30 days under RA 10173 data minimization.
    |
    | 3. Payment Receipts & Consultation Chat Images:
    |    Retained only for the post-transaction reconciliation / dispute window
    |    and then automatically purged from private storage.
    |
    */

    'discount_id_completed_days'       => (int) env('RETENTION_DISCOUNT_ID_COMPLETED_DAYS', 7),
    'discount_id_unfulfilled_days'     => (int) env('RETENTION_DISCOUNT_ID_UNFULFILLED_DAYS', 3),

    'prescription_dispensed_days'      => (int) env('RETENTION_PRESCRIPTION_DISPENSED_DAYS', 730),
    'prescription_unfulfilled_days'    => (int) env('RETENTION_PRESCRIPTION_UNFULFILLED_DAYS', 30),

    'payment_receipt_completed_days'   => (int) env('RETENTION_PAYMENT_RECEIPT_COMPLETED_DAYS', 90),
    'payment_receipt_unfulfilled_days' => (int) env('RETENTION_PAYMENT_RECEIPT_UNFULFILLED_DAYS', 30),

    'chat_image_days'                  => (int) env('RETENTION_CHAT_IMAGE_DAYS', 90),

];
