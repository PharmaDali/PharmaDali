<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class AdminVerifyTwoFactorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'two_factor_token' => ['required', 'string'],
            'otp'              => ['required', 'string', 'digits:6'],
        ];
    }
}
