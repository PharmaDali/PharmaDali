<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('pharmacy_admin');
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'subcategory' => ['nullable', 'string'],
            'affected_module' => ['nullable', 'string'],
            'contact_number' => ['nullable', 'string'],
            'preferred_contact_method' => ['nullable', 'string'],
            'priority' => ['required', 'in:low,medium,high,urgent'],
            'description' => ['required', 'string'],
            'steps_taken' => ['nullable', 'array'],
            'steps_taken.*' => ['string'],
        ];
    }
}