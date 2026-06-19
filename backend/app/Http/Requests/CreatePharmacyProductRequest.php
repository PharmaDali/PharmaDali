<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePharmacyProductRequest extends FormRequest
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
            'form'         => 'nullable|string|max:255',
            'strength'     => 'nullable|string|max:255',
            'size'         => 'nullable|string|max:255',
            'category_id'  => 'nullable|integer|exists:categories,id',
            'category_name'=> 'nullable|string|max:255',
            'stock'        => 'nullable|integer|min:0',
            'selling_price'=> 'nullable|numeric|min:0',
            'is_discountable' => 'nullable|boolean',
            'expiry_date'  => 'nullable|date',
            'is_prescribed'=> 'nullable|boolean',
            'batch_number' => 'nullable|string|max:100',
            'manufactured_date' => 'nullable|date',
        ];
    }
}
