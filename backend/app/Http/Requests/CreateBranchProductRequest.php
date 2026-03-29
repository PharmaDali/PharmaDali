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
            'product_name' => 'required|string|max:255',
            'generic_name' => 'required|string|max:255',
            'brand_name'   => 'required|string|max:255',
            'description'  => 'required|string',
            'form'         => 'required|string|max:255',
            'strength'     => 'required|string|max:255',
        ];
    }
}
