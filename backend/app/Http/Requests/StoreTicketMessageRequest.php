<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Ticket;

class StoreTicketMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $ticket = $this->route('ticket');
        $user = $this->user();
        
        if ($user->hasRole('super_admin')) {
            return true;
        }
        
        return $ticket->user_id === $user->id;
    }

    public function rules(): array
    {
        return [
            'message' => ['nullable', 'string', 'required_without:image'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048', 'required_without:message'],
        ];
    }
}