<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\PharmacyCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * GET /pharmacy/categories/all
     * List all categories for administrative management, with pharmacy-specific toggle state.
     */
    public function index(Request $request): JsonResponse
    {
        $pharmacyId = $request->user()?->pharmacy_id;

        $categories = Cache::remember('admin_categories_all', 3600, function () {
            return Category::orderBy('category_name')->get();
        });

        $branchOverrides = [];
        if ($pharmacyId) {
            $branchOverrides = Cache::remember("admin_categories_branch_{$pharmacyId}", 3600, function () use ($pharmacyId) {
                return PharmacyCategory::where('pharmacy_id', $pharmacyId)->pluck('is_enabled', 'category_id')->toArray();
            });
        }

        $categoriesData = $categories->map(function ($cat) use ($branchOverrides) {
            $isEnabled = array_key_exists($cat->id, $branchOverrides)
                ? (bool) $branchOverrides[$cat->id]
                : (bool) $cat->is_enabled;

            return [
                'id'                     => $cat->id,
                'name'                   => $cat->category_name,
                'enabled'                => $isEnabled,
                'background'             => $cat->background_color ?? '#e8f0fe',
                'font'                   => $cat->font_color ?? '#000000',
                'hero_title'             => $cat->hero_title,
                'hero_subtitle_template' => $cat->hero_subtitle_template,
            ];
        })->toArray();

        return response()->json([
            'status' => 'success',
            'data'   => $categoriesData,
        ]);
    }

    /**
     * PATCH /pharmacy/categories/{id}/toggle-status
     * Toggle enabled status of a category for the authenticated user's pharmacy branch.
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
        ]);

        $category = Category::findOrFail($id);
        $user = $request->user();
        $pharmacyId = $user?->pharmacy_id;
        $enabled = (bool) $validated['enabled'];

        if ($pharmacyId) {
            PharmacyCategory::updateOrCreate(
                [
                    'pharmacy_id' => $pharmacyId,
                    'category_id' => $id,
                ],
                [
                    'is_enabled'  => $enabled,
                ]
            );

            Cache::forget("pharmacy_categories:{$pharmacyId}");
            Cache::forget("admin_categories_branch_{$pharmacyId}");
        } else {
            // Fallback for global admin / users without a specific branch
            $category->update(['is_enabled' => $enabled]);
            Cache::forget('admin_categories_all');
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Category status updated successfully.',
            'data'    => [
                'id'      => $category->id,
                'name'    => $category->category_name,
                'enabled' => $enabled,
            ],
        ]);
    }

    /**
     * POST /pharmacy/categories/store
     * Create a new category (Super Admin only).
     */
    public function store(Request $request): JsonResponse
    {
        if (!in_array($request->user()?->role, ['super_admin', 'system_admin'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only super administrators can add new master categories.',
            ], 403);
        }

        $validated = $request->validate([
            'name'                   => 'required|string|max:255|unique:categories,category_name',
            'enabled'                => 'sometimes|boolean',
            'background'             => 'sometimes|string|max:20',
            'font'                   => 'sometimes|string|max:20',
            'hero_title'             => 'nullable|string|max:255',
            'hero_subtitle_template' => 'nullable|string|max:500',
        ], [
            'name.required' => 'Category name is required.',
            'name.unique'   => 'A category with this name already exists.',
        ]);

        $category = Category::create([
            'category_name'          => $validated['name'],
            'is_enabled'             => $validated['enabled'] ?? true,
            'background_color'       => $validated['background'] ?? '#e8f0fe',
            'font_color'             => $validated['font'] ?? '#000000',
            'hero_title'             => $validated['hero_title'] ?? null,
            'hero_subtitle_template' => $validated['hero_subtitle_template'] ?? null,
        ]);

        Cache::forget('admin_categories_all');

        return response()->json([
            'status'  => 'success',
            'message' => 'Category created successfully.',
            'data'    => [
                'id'                     => $category->id,
                'name'                   => $category->category_name,
                'enabled'                => (bool) $category->is_enabled,
                'background'             => $category->background_color,
                'font'                   => $category->font_color,
                'hero_title'             => $category->hero_title,
                'hero_subtitle_template' => $category->hero_subtitle_template,
            ],
        ], 201);
    }

    /**
     * PUT /pharmacy/categories/{id}
     * Update an existing category (Super Admin only).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        if (!in_array($request->user()?->role, ['super_admin', 'system_admin'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only super administrators can edit master categories.',
            ], 403);
        }

        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name'                   => 'sometimes|string|max:255|unique:categories,category_name,' . $id,
            'enabled'                => 'sometimes|boolean',
            'background'             => 'sometimes|string|max:20',
            'font'                   => 'sometimes|string|max:20',
            'hero_title'             => 'nullable|string|max:255',
            'hero_subtitle_template' => 'nullable|string|max:500',
        ], [
            'name.unique' => 'A category with this name already exists.',
        ]);

        $updateData = [];
        if (isset($validated['name'])) {
            $updateData['category_name'] = $validated['name'];
        }
        if (isset($validated['enabled'])) {
            $updateData['is_enabled'] = $validated['enabled'];
        }
        if (isset($validated['background'])) {
            $updateData['background_color'] = $validated['background'];
        }
        if (isset($validated['font'])) {
            $updateData['font_color'] = $validated['font'];
        }
        if (array_key_exists('hero_title', $validated)) {
            $updateData['hero_title'] = $validated['hero_title'];
        }
        if (array_key_exists('hero_subtitle_template', $validated)) {
            $updateData['hero_subtitle_template'] = $validated['hero_subtitle_template'];
        }

        $category->update($updateData);

        Cache::forget('admin_categories_all');

        return response()->json([
            'status'  => 'success',
            'message' => 'Category updated successfully.',
            'data'    => [
                'id'                     => $category->id,
                'name'                   => $category->category_name,
                'enabled'                => (bool) $category->is_enabled,
                'background'             => $category->background_color,
                'font'                   => $category->font_color,
                'hero_title'             => $category->hero_title,
                'hero_subtitle_template' => $category->hero_subtitle_template,
            ],
        ]);
    }

    /**
     * DELETE /pharmacy/categories/{id}
     * Delete a category (Super Admin only).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!in_array($request->user()?->role, ['super_admin', 'system_admin'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only super administrators can delete master categories.',
            ], 403);
        }

        $category = Category::findOrFail($id);
        $category->delete();

        Cache::forget('admin_categories_all');

        return response()->json([
            'status'  => 'success',
            'message' => 'Category deleted successfully.',
        ]);
    }
}
