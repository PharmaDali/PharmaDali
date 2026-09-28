<?php

namespace App\Http\Requests\Auth;

use App\Models\Pharmacist;
use App\Rules\NoEmoji;
use App\Rules\ValidName;
use App\Traits\NormalizesMobileNumber;
use Illuminate\Foundation\Http\FormRequest;

class PharmacistRegisterRequest extends FormRequest
{
    use NormalizesMobileNumber;

    public function authorize(): bool
    {
        return (bool) $this->user()?->can('create', Pharmacist::class);
    }

    public function rules(): array
    {
        return [
            'first_name'      => ['required', 'string', new ValidName(), new NoEmoji()],
            'last_name'       => ['required', 'string', new ValidName(), new NoEmoji()],
            'email'           => ['required', 'email', 'max:100', 'unique:users,email', new NoEmoji()],
            'mobile_number'   => ['required', 'string', 'regex:/^09\d{9}$/', new NoEmoji()],
            'date_of_birth'   => ['nullable', 'date'],
            'address'         => ['nullable', 'string', 'min:5', 'max:150', new NoEmoji()],
            'license_number'  => ['nullable', 'string', 'max:50', new NoEmoji()],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required'      => 'First name is required.',
            'last_name.required'       => 'Last name is required.',
            'email.required'           => 'Email is required.',
            'email.unique'             => 'This email is already taken.',
            'mobile_number.required'   => 'Mobile number is required.',
            'mobile_number.regex'      => 'Mobile number must be a valid 11-digit number starting with 09.',
            'license_number.unique'    => 'This license number is already taken.',
        ];
    }
}
