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
            'body' => ['required_without:image', 'nullable', 'string', 'max:2000'],
            'image' => ['required_without:body', 'nullable', 'image', 'max:5120'],
            'message_type' => ['sometimes', 'string', 'in:user,internal_note'],
            'visibility' => ['sometimes', 'string', 'in:public,staff_only'],
        ];
    }
}