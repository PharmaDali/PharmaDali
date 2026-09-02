<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminStoreUserRequest;
use App\Http\Requests\Admin\AdminUpdateUserRequest;
use App\Services\User\AdminUserService;
use Illuminate\Http\JsonResponse;

class AdminUserController extends Controller
{
    public function __construct(
        private AdminUserService $adminUserService
    ) {}

    public function index(): JsonResponse
    {
        return $this->adminUserService->index();
    }

    public function store(AdminStoreUserRequest $request): JsonResponse 
    {
        return $this->adminUserService->store($request->validated(), $request->user());
    }

    public function update(AdminUpdateUserRequest $request, string $id): JsonResponse
    {
        return $this->adminUserService->update($request->validated(), $id);
    }

    public function destroy(string $id): JsonResponse
    {
        return $this->adminUserService->destroy($id);
    }
}
