<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class UploadDiscountIdImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'discount_id_image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'discount_type'     => ['nullable', 'string', 'in:senior_citizen,pwd,employee,student,diplomat'],
        ];
    }

    public function messages(): array
    {
        return [
            'discount_id_image.required' => 'The discount customer ID image is required.',
            'discount_id_image.image'    => 'The uploaded file must be a valid image.',
            'discount_id_image.mimes'    => 'The image must be a file of type: jpg, jpeg, png, webp.',
            'discount_id_image.max'      => 'The image may not be greater than 5MB.',
        ];
    }
}
