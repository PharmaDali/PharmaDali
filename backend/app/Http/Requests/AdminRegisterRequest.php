<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'    => ['required', 'string', 'max:255'],
            'last_name'     => ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'      => ['required', 'string', 'min:8', 'confirmed'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'date_of_birth' => ['nullable', 'date'],
            'address'       => ['nullable', 'string', 'max:255'],
            'role'          => ['required', Rule::in(['branch_admin', 'super_admin'])],
            'branch_id'     => ['nullable', 'exists:branches,id'],
            'is_active'     => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->sometimes('branch_id', ['required'], function ($input) {
            return ($input->role ?? null) === 'branch_admin';
        });
    }

    public function messages(): array
    {
        return [
            'first_name.required'    => 'First name is required.',
            'last_name.required'     => 'Last name is required.',
            'email.required'         => 'Email is required.',
            'email.unique'           => 'This email is already taken.',
            'password.required'      => 'Password is required.',
            'password.min'           => 'Password must be at least 8 characters.',
            'password.confirmed'     => 'Password confirmation does not match.',
            'mobile_number.required' => 'Mobile number is required.',
            'role.required'          => 'Admin role is required.',
            'role.in'                => 'Role must be either branch_admin or super_admin.',
            'branch_id.required'     => 'Branch is required for branch admin accounts.',
            'branch_id.exists'       => 'Selected branch does not exist.',
        ];
    }
}
