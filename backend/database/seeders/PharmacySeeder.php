<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pharmacy;

class PharmacySeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Preserves the 3 existing pharmacies with their exact configurations.
     */
    public function run(): void
    {
        $pharmacies = [
            [
                'id'                            => 1,
                'pharmacy_name'                 => 'Puremed Pharmacy',
                'location'                      => 'Tanauan City, Batangas',
                'contact_number'                => '09223828228',
                'email'                         => 'thisis.acadpurposesonly@gmail.com',
                'logo_path'                     => 'logos/pharmacy_1/D3xNRtU1S4qsDY3QHc9Uk1MXfbnLkSlQ2O57h0fq.jpg',
                'payment_qr_code_path'          => 'payment_qrs/pharmacy_1/InoxCqsNVemFYI3Kp0RxGIn9GciO5b55Va6BJNiC.jpg',
                'gcash_name'                    => 'Puremed Pharmacy',
                'gcash_number'                  => '09223828228',
                'enable_online_payment'         => true,
                'tin'                           => null,
                'vat_type'                      => 'vat',
                'bir_permit_no'                 => null,
                'printer_name'                  => 'POS Thermal Printer (USB)',
                'print_after_payment'           => false,
                'receipt_header'                => 'PureMed Pharmacy',
                'receipt_footer'                => 'Thank you for choosing PureMed Pharmacy! Get well soon.',
                'receipt_sort_by'               => 'By Added Order',
                'show_discount_on_receipt'      => true,
                'show_vat_breakdown_on_receipt' => false,
                'is_active'                     => true,
                'is_manually_closed'            => false,
                'opening_hour'                  => '00:00:00',
                'closing_hour'                  => '23:59:00',
                'low_stock_threshold'           => 50,
                'shortage_days_threshold'       => 7,
                'expiry_days_threshold'         => 30,
                'enable_vat_exemption_discount' => false,
                'allow_otc_discount'            => true,
                'item_exchange_window_days'     => 1,
                'allow_item_exchange'           => true,
                'allow_cash_refund'             => false,
            ],
            [
                'id'                            => 2,
                'pharmacy_name'                 => 'Landicho Drugstore',
                'location'                      => 'Tanauan City, Batangas',
                'contact_number'                => '09123456789',
                'email'                         => null,
                'logo_path'                     => 'logos/pharmacy_2/curkCypta1gTRCIaepQhDyIv2PrC5Qs6fVAJMb4x.jpg',
                'payment_qr_code_path'          => 'payment_qrs/pharmacy_2/InoxCqsNVemFYI3Kp0RxGIn9GciO5b55Va6BJNiC.jpg',
                'gcash_name'                    => 'Landicho Drugstore',
                'gcash_number'                  => '09123456789',
                'enable_online_payment'         => true,
                'tin'                           => null,
                'vat_type'                      => 'vat',
                'bir_permit_no'                 => null,
                'printer_name'                  => 'POS Thermal Printer (USB)',
                'print_after_payment'           => true,
                'receipt_header'                => 'Landicho Drugstore',
                'receipt_footer'                => 'Thank you for choosing Landicho Drugstore! Get well soon.',
                'receipt_sort_by'               => 'By Added Order',
                'show_discount_on_receipt'      => true,
                'show_vat_breakdown_on_receipt' => true,
                'is_active'                     => true,
                'is_manually_closed'            => false,
                'opening_hour'                  => '07:00:00',
                'closing_hour'                  => '21:00:00',
                'low_stock_threshold'           => 10,
                'shortage_days_threshold'       => 7,
                'expiry_days_threshold'         => 30,
                'enable_vat_exemption_discount' => false,
                'allow_otc_discount'            => true,
                'item_exchange_window_days'     => 1,
                'allow_item_exchange'           => true,
                'allow_cash_refund'             => true,
            ],
            [
                'id'                            => 3,
                'pharmacy_name'                 => "Calloway Pharmacy",
                'location'                      => 'Tanauan City, Batangas',
                'contact_number'                => '09123456789',
                'email'                         => null,
                'logo_path'                     => null,
                'payment_qr_code_path'          => 'payment_qrs/pharmacy_3/InoxCqsNVemFYI3Kp0RxGIn9GciO5b55Va6BJNiC.jpg',
                'gcash_name'                    => 'Calloway Pharmacy',
                'gcash_number'                  => '09123456789',
                'enable_online_payment'         => true,
                'tin'                           => null,
                'vat_type'                      => 'vat',
                'bir_permit_no'                 => null,
                'printer_name'                  => 'POS Thermal Printer (USB)',
                'print_after_payment'           => true,
                'receipt_header'                => "Calloway Pharmacy",
                'receipt_footer'                => "Thank you for choosing Calloway Pharmacy! Get well soon.",
                'receipt_sort_by'               => 'By Added Order',
                'show_discount_on_receipt'      => true,
                'show_vat_breakdown_on_receipt' => true,
                'is_active'                     => true,
                'is_manually_closed'            => false,
                'opening_hour'                  => '09:00:00',
                'closing_hour'                  => '21:00:00',
                'low_stock_threshold'           => 10,
                'shortage_days_threshold'       => 7,
                'expiry_days_threshold'         => 30,
                'enable_vat_exemption_discount' => false,
                'allow_otc_discount'            => true,
                'item_exchange_window_days'     => 1,
                'allow_item_exchange'           => true,
                'allow_cash_refund'             => false,
            ],
        ];

        foreach ($pharmacies as $data) {
            Pharmacy::updateOrCreate(
                ['id' => $data['id']],
                $data
            );
        }
    }
}
