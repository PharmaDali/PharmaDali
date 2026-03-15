<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PharmacistLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_number' => ['required', 'string'],
            'password'        => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'employee_number.required' => 'Employee number is required.',
            'password.required'        => 'Password is required.',
        ];
    }
}