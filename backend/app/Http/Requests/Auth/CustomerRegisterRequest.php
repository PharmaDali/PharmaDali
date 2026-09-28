<?php

namespace App\Http\Requests\Auth;

use App\Rules\NoEmoji;
use App\Rules\ValidName;
use App\Traits\NormalizesMobileNumber;
use Illuminate\Foundation\Http\FormRequest;

class CustomerRegisterRequest extends FormRequest
{
    use NormalizesMobileNumber;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'    => ['required', 'string', new ValidName(), new NoEmoji()],
            'last_name'     => ['required', 'string', new ValidName(), new NoEmoji()],
            'email'         => ['required', 'email', 'max:100', 'unique:users,email', new NoEmoji()],
            'password'      => ['required', 'string', 'min:8', 'max:64', 'confirmed', new NoEmoji()],
            'mobile_number' => ['required', 'string', 'regex:/^09\d{9}$/', new NoEmoji()],
            'date_of_birth' => ['required', 'date', 'before_or_equal:-18 years'],
            'address'       => ['nullable', 'string', 'min:5', 'max:150', new NoEmoji()],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required'             => 'First name is required.',
            'last_name.required'              => 'Last name is required.',
            'email.required'                  => 'Email is required.',
            'email.unique'                    => 'This email is already taken.',
            'password.required'               => 'Password is required.',
            'password.min'                    => 'Password must be at least 8 characters.',
            'password.max'                    => 'Password must not exceed 64 characters.',
            'password.confirmed'              => 'Password confirmation does not match.',
            'mobile_number.required'          => 'Mobile number is required.',
            'mobile_number.regex'             => 'Mobile number must be a valid 11-digit number starting with 09.',
            'date_of_birth.required'          => 'Date of birth is required.',
            'date_of_birth.before_or_equal'   => 'You must be at least 18 years old to register.',
        ];
    }
}
