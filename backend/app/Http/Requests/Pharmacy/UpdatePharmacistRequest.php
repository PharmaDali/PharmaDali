<?php

namespace App\Http\Requests\Pharmacy;

use App\Rules\NoEmoji;
use App\Rules\ValidName;
use App\Traits\NormalizesMobileNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePharmacistRequest extends FormRequest
{
    use NormalizesMobileNumber;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('pharmacist');

        return [
            'first_name'     => ['sometimes', 'string', new ValidName(), new NoEmoji()],
            'last_name'      => ['sometimes', 'string', new ValidName(), new NoEmoji()],
            'email'          => ['sometimes', 'email', 'max:100', Rule::unique('users', 'email')->ignore($userId), new NoEmoji()],
            'mobile_number'  => ['sometimes', 'string', 'regex:/^09\d{9}$/', new NoEmoji()],
            'date_of_birth'  => ['nullable', 'date'],
            'address'        => ['nullable', 'string', 'min:5', 'max:150', new NoEmoji()],
            'is_active'      => ['sometimes', 'boolean'],
            'license_number' => ['nullable', 'string', 'max:50', new NoEmoji()],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'        => 'This email is already taken.',
            'mobile_number.regex' => 'Mobile number must be a valid 11-digit number starting with 09.',
        ];
    }
}
