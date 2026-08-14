<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Exceptions\HttpResponseException;

trait ApiResponseTrait
{
    protected function successResponse($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        $payload = [
            'success' => true,
            'status'  => 'success',
            'message' => $message,
        ];

        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json($payload, $code);
    }

    protected function errorResponse(string $message = 'Error', int $code = 400, $errors = null): JsonResponse
    {
        $payload = [
            'success' => false,
            'status'  => 'error',
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $code);
    }

    protected function authorizePermission(?string $permission = null, string $message = 'Unauthorized Access'): void
    {
        $user = request()->user();

        if (!$user || ($user->role === 'pharmacist' && ($permission === null || !$user->hasPermission($permission)))) {
            throw new HttpResponseException(
                $this->errorResponse($message, 403)
            );
        }
    }
}
