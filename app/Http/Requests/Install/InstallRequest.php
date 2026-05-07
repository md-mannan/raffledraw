<?php

namespace App\Http\Requests\Install;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class InstallRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $adminEmailRules = ['required', 'email', 'max:255'];
        // During first-run install, migrations may not have been executed yet.
        // Avoid querying a missing `users` table during validation.
        if (Schema::hasTable('users')) {
            $adminEmailRules[] = Rule::unique('users', 'email');
        }

        return [
            'language' => ['required', 'string', 'in:en,bn'],

            'app_name' => ['required', 'string', 'max:255'],
            'app_url' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,svg', 'max:4096'],

            'currency' => ['required', 'string', 'size:3'],

            'db_driver' => ['required', 'string', 'in:sqlite,mysql'],
            'db_host' => ['required_if:db_driver,mysql', 'nullable', 'string', 'max:255'],
            'db_port' => ['required_if:db_driver,mysql', 'nullable', 'integer', 'min:1', 'max:65535'],
            'db_database' => ['required', 'string', 'max:255'],
            'db_username' => ['required_if:db_driver,mysql', 'nullable', 'string', 'max:255'],
            'db_password' => ['nullable', 'string', 'max:255'],

            'admin_name' => ['required', 'string', 'max:255'],
            'admin_email' => $adminEmailRules,
            'admin_password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ];
    }
}

