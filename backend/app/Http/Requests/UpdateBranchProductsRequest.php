<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBranchProductsRequest extends FormRequest
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
            'product_type'  => 'sometimes|string|in:medicine,non_medicine',
            'product_name'  => 'sometimes|string|max:255',
            'generic_name'  => 'sometimes|nullable|required_if:product_type,medicine|string|max:255',
            'brand_name'    => 'sometimes|nullable|string|max:255',
            'description'   => 'sometimes|nullable|string',
            'form'          => 'sometimes|nullable|required_if:product_type,medicine|string|max:255',
            'strength'      => 'sometimes|nullable|required_if:product_type,medicine|string|max:255',
        ];
    }
}
