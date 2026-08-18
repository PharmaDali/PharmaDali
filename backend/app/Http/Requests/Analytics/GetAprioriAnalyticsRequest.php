<?php

namespace App\Http\Requests\Analytics;

use Illuminate\Foundation\Http\FormRequest;

class GetAprioriAnalyticsRequest extends FormRequest
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
            'months' => 'sometimes|integer|min:1|max:24',
            'min_support' => 'sometimes|numeric|min:0.01|max:1.0',
            'min_confidence' => 'sometimes|numeric|min:0.01|max:1.0',
            'pharmacy_id' => 'sometimes|integer|exists:pharmacies,id',
        ];
    }

    /**
     * Resolve the targeted pharmacy ID context.
     */
    public function getPharmacyId(): int
    {
        return (int) ($this->user()?->pharmacy_id ?? $this->input('pharmacy_id', 0));
    }
}
