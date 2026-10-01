<?php

namespace App\Http\Requests\Pharmacist;

use App\Rules\NoEmoji;
use App\Rules\ValidName;
use App\Traits\NormalizesMobileNumber;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePharmacistProfileRequest extends FormRequest
{
    use NormalizesMobileNumber;

    public function authorize(): bool
    {
        return $this->user() !== null && in_array($this->user()->role, ['pharmacist', 'pharmacy_admin'], true);
    }

    public function rules(): array
    {
        return [
            'first_name'      => ['sometimes', 'required', 'string', 'max:50', new ValidName(), new NoEmoji()],
            'last_name'       => ['sometimes', 'required', 'string', 'max:50', new ValidName(), new NoEmoji()],
            'mobile_number'   => ['sometimes', 'required', 'string', 'regex:/^09\d{9}$/', new NoEmoji()],
            'date_of_birth'   => ['nullable', 'date'],
            'address'         => ['nullable', 'string', 'min:5', 'max:150', new NoEmoji()],
            'email'           => ['prohibited'],
            'employee_number' => ['prohibited'],
            'license_number'  => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required'    => 'First name is required.',
            'last_name.required'     => 'Last name is required.',
            'mobile_number.required' => 'Mobile number is required.',
            'mobile_number.regex'    => 'Mobile number must be a valid 11-digit number starting with 09.',
            'email.prohibited'       => 'Email address cannot be changed.',
        ];
    }
}
