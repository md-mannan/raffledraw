<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SomitiUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'currency' => ['required', 'string', 'size:3'],
            'monthly_amount' => ['nullable', 'numeric', 'min:0', 'max:100000000'],
            'spin_sound' => ['nullable', 'string', 'max:255'],
            'celebration_sound' => ['nullable', 'string', 'max:255'],
            'spin_sound_file' => ['nullable', 'file', 'mimes:mp3,wav,ogg', 'max:5120'],
            'celebration_sound_file' => ['nullable', 'file', 'mimes:mp3,wav,ogg', 'max:5120'],
        ];
    }
}

