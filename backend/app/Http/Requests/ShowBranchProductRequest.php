<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShowBranchProductRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->route('branchId')) {
            $this->merge([
                'branch_id' => $this->route('branchId'),
            ]);
        }
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'force_refresh' => ['sometimes', 'boolean'],
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('branch_products', 'category_id')->where(function ($query) {
                    return $query->where('branch_id', $this->input('branch_id'));
                }),
            ],
            'cursor' => ['nullable', 'string'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'query' => ['sometimes', 'string', 'min:1', 'max:100'],
        ];
    }
}
