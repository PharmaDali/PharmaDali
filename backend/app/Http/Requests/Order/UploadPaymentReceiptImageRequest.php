<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class UploadPaymentReceiptImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'payment_receipt_image' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120', // 5MB max size
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'payment_receipt_image.required' => 'A payment receipt image is required.',
            'payment_receipt_image.image'    => 'The uploaded file must be an image.',
            'payment_receipt_image.mimes'    => 'The image must be a file of type: jpg, jpeg, png, webp.',
            'payment_receipt_image.max'      => 'The image size must not exceed 5MB.',
        ];
    }
}
