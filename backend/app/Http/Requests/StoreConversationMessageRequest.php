<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:2000'],
            'message_type' => ['sometimes', 'string', 'in:user,internal_note'],
            'visibility' => ['sometimes', 'string', 'in:public,staff_only'],
        ];
    }
}