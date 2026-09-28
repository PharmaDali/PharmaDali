<?php

namespace App\Http\Requests\Admin;

use App\Rules\NoEmoji;
use App\Rules\ValidName;
use App\Traits\NormalizesMobileNumber;
use Illuminate\Foundation\Http\FormRequest;

class AdminStoreUserRequest extends FormRequest
{
    use NormalizesMobileNumber;

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
            'first_name'    => ['required', 'string', new ValidName(), new NoEmoji()],
            'last_name'     => ['nullable', 'string', new ValidName(), new NoEmoji()],
            'email'         => ['required', 'email', 'max:100', 'unique:users,email', new NoEmoji()],
            'mobile_number' => ['nullable', 'string', 'max:20', new NoEmoji()],
            'role'          => ['required', 'string'],
            'pharmacy_id'   => ['nullable', 'exists:pharmacies,id'],
            'is_active'     => ['boolean'],
        ];
    }
}
