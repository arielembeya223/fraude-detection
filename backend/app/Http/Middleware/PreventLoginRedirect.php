<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class PreventLoginRedirect extends Middleware
{
    protected function redirectTo($request): ?string
    {
        // Pour une API, on ne redirige jamais, on retourne juste 401
        return null;
    }
}
