<?php

namespace App\Http\Controllers\Media;

use App\Http\Controllers\Controller;
use App\Services\Media\ServePrivateMediaService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PrivateMediaController extends Controller
{
    public function __construct(
        private readonly ServePrivateMediaService $servePrivateMediaService
    ) {}

    /**
     * Securely stream private media through the dedicated media service.
     */
    public function show(Request $request, string $path): Response
    {
        return $this->servePrivateMediaService->handle($request, $path);
    }
}
