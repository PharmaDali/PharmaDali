<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogEndpointStatusMiddleware
{
    /**
     * Handle an incoming request and log whether the endpoint was SUCCESSFUL or FAILED.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = defined('LARAVEL_START') ? LARAVEL_START : microtime(true);

        try {
            $response = $next($request);
            $this->logEndpoint($request, $response, $startTime);
            return $response;
        } catch (\Throwable $e) {
            $this->logException($request, $e, $startTime);
            throw $e;
        }
    }

    /**
     * Format and output endpoint execution status to stdout.
     */
    protected function logEndpoint(Request $request, Response $response, float $startTime): void
    {
        $statusCode = $response->getStatusCode();
        $durationMs = round((microtime(true) - $startTime) * 1000);
        $method = strtoupper($request->method());
        $uri = $request->getRequestUri();
        $time = date('H:i:s');

        // Determine status tag and color (ANSI codes for terminal)
        if ($statusCode >= 200 && $statusCode < 300) {
            $statusText = Response::$statusTexts[$statusCode] ?? 'OK';
            $badge = "\033[1;32m✔ [SUCCESS {$statusCode} {$statusText}]\033[0m";
        } elseif ($statusCode >= 300 && $statusCode < 400) {
            $statusText = Response::$statusTexts[$statusCode] ?? 'REDIRECT';
            $badge = "\033[1;36m➜ [REDIRECT {$statusCode} {$statusText}]\033[0m";
        } elseif ($statusCode >= 400 && $statusCode < 500) {
            $statusText = Response::$statusTexts[$statusCode] ?? 'CLIENT ERROR';
            $badge = "\033[1;33m⚠ [FAILED {$statusCode} {$statusText}]\033[0m";
        } else {
            $statusText = Response::$statusTexts[$statusCode] ?? 'SERVER ERROR';
            $badge = "\033[1;31m✖ [FAILED {$statusCode} {$statusText}]\033[0m";
        }

        $methodFormatted = $this->formatMethod($method);

        // Extract clear error reason for 4xx and 5xx responses
        $errorReason = '';
        if ($statusCode >= 400 && $response instanceof JsonResponse) {
            $data = $response->getData(true);
            if (!empty($data['errors']) && is_array($data['errors'])) {
                $firstField = array_key_first($data['errors']);
                $firstVal = $data['errors'][$firstField];
                $firstErr = is_array($firstVal) ? ($firstVal[0] ?? '') : (string) $firstVal;
                $errorReason = " \033[90m- [{$firstField}] {$firstErr}\033[0m";
            } elseif (!empty($data['message'])) {
                $errorReason = " \033[90m- {$data['message']}\033[0m";
            } elseif (!empty($data['error'])) {
                $errorStr = is_string($data['error']) ? $data['error'] : json_encode($data['error']);
                $errorReason = " \033[90m- {$errorStr}\033[0m";
            }
        }

        $logLine = "[$time] {$badge} {$methodFormatted} {$uri} \033[90m({$durationMs}ms)\033[0m{$errorReason}" . PHP_EOL;

        $this->writeToTerminal($logLine);
    }

    /**
     * Log an unhandled exception before it bubbles up.
     */
    protected function logException(Request $request, \Throwable $e, float $startTime): void
    {
        $durationMs = round((microtime(true) - $startTime) * 1000);
        $method = strtoupper($request->method());
        $uri = $request->getRequestUri();
        $time = date('H:i:s');
        $badge = "\033[1;31m✖ [FAILED 500 SERVER EXCEPTION]\033[0m";
        $methodFormatted = $this->formatMethod($method);
        $error = substr($e->getMessage(), 0, 150);

        $logLine = "[$time] {$badge} {$methodFormatted} {$uri} \033[90m({$durationMs}ms)\033[0m \033[31m- {$error}\033[0m" . PHP_EOL;

        $this->writeToTerminal($logLine);
    }

    /**
     * Colorize HTTP method for terminal clarity.
     */
    protected function formatMethod(string $method): string
    {
        return match ($method) {
            'GET' => "\033[34mGET   \033[0m",
            'POST' => "\033[32mPOST  \033[0m",
            'PUT' => "\033[33mPUT   \033[0m",
            'PATCH' => "\033[33mPATCH \033[0m",
            'DELETE' => "\033[31mDELETE\033[0m",
            default => str_pad($method, 6),
        };
    }

    /**
     * Safely output to stdout.
     */
    protected function writeToTerminal(string $message): void
    {
        @file_put_contents('php://stdout', $message);
    }
}

