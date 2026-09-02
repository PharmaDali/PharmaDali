<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $this->route('user'),
            'mobile_number' => 'nullable|string|max:20',
            'role' => 'sometimes|string',
            'pharmacy_id' => 'nullable|exists:pharmacies,id',
            'is_active' => 'boolean',
        ];
    }
}
