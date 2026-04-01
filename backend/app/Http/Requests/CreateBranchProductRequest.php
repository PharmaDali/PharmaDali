<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBranchProductRequest extends FormRequest
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
            'product_type'  => 'required|string|in:medicine,non_medicine',
            'product_name' => 'required|string|max:255',
            'generic_name' => 'nullable|required_if:product_type,medicine|string|max:255',
            'brand_name'   => 'nullable|string|max:255',
            'description'  => 'nullable|string',
            'form'         => 'nullable|required_if:product_type,medicine|string|max:255',
            'strength'     => 'nullable|required_if:product_type,medicine|string|max:255',
        ];
    }
}
