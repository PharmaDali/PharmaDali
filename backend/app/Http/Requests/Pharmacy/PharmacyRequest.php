<?php

namespace App\Http\Requests\Pharmacy;

use Illuminate\Foundation\Http\FormRequest;

class PharmacyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'pharmacy_name'  => 'required|string|max:255',
            'location'       => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email'          => 'nullable|email|max:255',
            'opening_hour'   => 'required|date_format:H:i,H:i:s',
            'closing_hour'   => 'required|date_format:H:i,H:i:s|after:opening_hour',
            'is_active'      => 'boolean',
        ];

        if ($this->isMethod('post')) {
            $rules['admin_first_name']    = 'required|string|max:255';
            $rules['admin_last_name']     = 'nullable|string|max:255';
            $rules['admin_email']         = 'required|email|max:255|unique:users,email';
            $rules['admin_mobile_number'] = 'nullable|string|max:20';
        }

        return $rules;
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'opening_hour.required' => 'The opening time is required.',
            'closing_hour.required' => 'The closing time is required.',
            'closing_hour.after'    => 'The closing time must be later than the opening time.',
        ];
    }
}
