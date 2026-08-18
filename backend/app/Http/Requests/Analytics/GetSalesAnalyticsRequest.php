<?php

namespace App\Http\Requests\Analytics;

use Illuminate\Foundation\Http\FormRequest;

class GetSalesAnalyticsRequest extends FormRequest
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
            'timeframe' => 'sometimes|string|in:daily,weekly,monthly,yearly',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
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
