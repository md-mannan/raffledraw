# RaffleDraw (Laravel + Inertia)

## Production deploy checklist

### Environment
- Set `APP_ENV=production`
- Set `APP_DEBUG=false`
- Set `APP_URL` to your **real HTTPS** URL
- Set correct DB credentials

### Install dependencies
- `composer install --no-dev --optimize-autoloader`
- `npm ci`
- `npm run build`

### Storage + permissions
- Ensure `storage/` and `bootstrap/cache/` are writable by the web server
- Run `php artisan storage:link`

### Migrations
- Run `php artisan migrate --force`

### Caches (recommended)
- `php artisan config:cache`
- `php artisan route:cache`
- `php artisan view:cache`
- `php artisan event:cache`

### Sounds troubleshooting
Default sounds are served from **relative URLs** so they work even if `APP_URL` is misconfigured:
- Preferred: `/storage/audio/spin.mp3` and `/storage/audio/applause.mp3`
- Fallback: `/audio/spin.mp3` and `/audio/applause.mp3`

If sounds still don’t play:
- Verify these URLs open directly in the browser (200 OK)
- Ensure `public/storage` exists (symlink or folder) and points to `storage/app/public`
