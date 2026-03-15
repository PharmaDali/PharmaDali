<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'      => ['required', 'string', 'max:255'],
            'last_name'       => ['required', 'string', 'max:255'],
            'email'           => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'        => ['required', 'string', 'min:8', 'confirmed'],
            'mobile_number'   => ['required', 'string', 'max:20'],
            'date_of_birth'   => ['nullable', 'date'],
            'address'         => ['nullable', 'string', 'max:255'],
            'role'            => ['sometimes', Rule::in(['customer', 'pharmacist', 'admin'])],
            'employee_number' => ['required_if:role,pharmacist', 'nullable', 'string', 'max:255', 'unique:pharmacists,employee_number'],
            'license_number'  => ['required_if:role,pharmacist', 'nullable', 'string', 'max:255', 'unique:pharmacists,license_number'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required'      => 'First name is required.',
            'last_name.required'       => 'Last name is required.',
            'email.required'           => 'Email is required.',
            'email.unique'             => 'This email is already taken.',
            'password.required'        => 'Password is required.',
            'password.min'             => 'Password must be at least 8 characters.',
            'password.confirmed'       => 'Password confirmation does not match.',
            'mobile_number.required'   => 'Mobile number is required.',
            'employee_number.required_if' => 'Employee number is required for pharmacist accounts.',
            'license_number.required_if'  => 'License number is required for pharmacist accounts.',
            'employee_number.unique'   => 'This employee number is already taken.',
            'license_number.unique'    => 'This license number is already taken.',
        ];
    }
}