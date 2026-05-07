<?php

namespace App\Support;

class EnvEditor
{
    public static function setMany(array $pairs, ?string $path = null): void
    {
        $path = $path ?? base_path('.env');

        $contents = file_exists($path) ? file_get_contents($path) : '';
        if ($contents === false) {
            throw new \RuntimeException('Unable to read .env file.');
        }

        foreach ($pairs as $key => $value) {
            $contents = self::set($contents, (string) $key, (string) $value);
        }

        if (file_put_contents($path, $contents) === false) {
            throw new \RuntimeException('Unable to write .env file.');
        }
    }

    protected static function set(string $env, string $key, string $value): string
    {
        $quoted = self::quote($value);
        $pattern = "/^{$key}=.*$/m";

        if (preg_match($pattern, $env) === 1) {
            return preg_replace($pattern, "{$key}={$quoted}", $env) ?? $env;
        }

        $suffix = str_ends_with($env, "\n") || $env === '' ? '' : "\n";
        return $env.$suffix."{$key}={$quoted}\n";
    }

    protected static function quote(string $value): string
    {
        if ($value === '') {
            return '""';
        }

        // Quote if contains spaces or special chars.
        if (preg_match('/\\s|#|"|\'|=/', $value)) {
            $escaped = str_replace('"', '\\"', $value);
            return '"'.$escaped.'"';
        }

        return $value;
    }
}

