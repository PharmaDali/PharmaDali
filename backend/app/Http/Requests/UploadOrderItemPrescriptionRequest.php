<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadOrderItemPrescriptionRequest extends FormRequest
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
            'prescription_image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return[
            'prescription_image.required' => 'The prescription image is required.',
            'prescription_image.image' => 'The uploaded file must be an image.',
            'prescription_image.mimes' => 'The prescription image must be a file of type: jpg, jpeg, png, webp.',
            'prescription_image.max' => 'The prescription image may not be greater than 5MB.',
        ];
    } 
}
