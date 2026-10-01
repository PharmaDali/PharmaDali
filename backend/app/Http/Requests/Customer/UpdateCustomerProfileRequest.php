<?php

namespace App\Http\Requests\Customer;

use App\Rules\NoEmoji;
use App\Rules\ValidName;
use App\Traits\NormalizesMobileNumber;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerProfileRequest extends FormRequest
{
    use NormalizesMobileNumber;

    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->role === 'customer';
    }

    public function rules(): array
    {
        return [
            'first_name'    => ['sometimes', 'required', 'string', 'max:50', new ValidName(), new NoEmoji()],
            'last_name'     => ['sometimes', 'required', 'string', 'max:50', new ValidName(), new NoEmoji()],
            'mobile_number' => ['sometimes', 'required', 'string', 'regex:/^09\d{9}$/', new NoEmoji()],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:-18 years'],
            'address'       => ['nullable', 'string', 'min:5', 'max:150', new NoEmoji()],
            'email'         => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required'           => 'First name is required.',
            'last_name.required'            => 'Last name is required.',
            'mobile_number.required'        => 'Mobile number is required.',
            'mobile_number.regex'           => 'Mobile number must be a valid 11-digit number starting with 09.',
            'date_of_birth.before_or_equal' => 'You must be at least 18 years old.',
            'email.prohibited'              => 'Email address cannot be changed.',
        ];
    }
}
