<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShowPharmacyProductRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->route('pharmacyId')) {
            $this->merge([
                'pharmacy_id' => $this->route('pharmacyId'),
            ]);
        }
    }

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
            'pharmacy_id' => ['required', 'integer', 'exists:pharmacies,id'],
            'force_refresh' => ['sometimes', 'boolean'],
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('pharmacy_products', 'category_id')->where(function ($query) {
                    return $query->where('pharmacy_id', $this->input('pharmacy_id'));
                }),
            ],
            'cursor' => ['nullable', 'string'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'query' => ['sometimes', 'string', 'min:1', 'max:100'],
        ];
    }
}
