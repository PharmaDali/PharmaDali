<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * GET /pharmacy/categories/all
     * List all categories for administrative management.
     */
    public function index(): JsonResponse
    {
        $categoriesData = Cache::remember('admin_categories_all', 3600, function () {
            $categories = Category::orderBy('category_name')->get();

            return $categories->map(function ($cat) {
                return [
                    'id'         => $cat->id,
                    'name'       => $cat->category_name,
                    'enabled'    => (bool) $cat->is_enabled,
                    'background' => $cat->background_color ?? '#e8f0fe',
                    'font'       => $cat->font_color ?? '#000000',
                ];
            })->toArray();
        });

        return response()->json([
            'status' => 'success',
            'data'   => $categoriesData,
        ]);
    }

    /**
     * POST /pharmacy/categories/store
     * Create a new category.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255|unique:categories,category_name',
            'enabled'    => 'sometimes|boolean',
            'background' => 'sometimes|string|max:20',
            'font'       => 'sometimes|string|max:20',
        ], [
            'name.required' => 'Category name is required.',
            'name.unique'   => 'A category with this name already exists.',
        ]);

        $category = Category::create([
            'category_name'    => $validated['name'],
            'is_enabled'       => $validated['enabled'] ?? true,
            'background_color' => $validated['background'] ?? '#e8f0fe',
            'font_color'       => $validated['font'] ?? '#000000',
        ]);

        Cache::forget('admin_categories_all');

        return response()->json([
            'status'  => 'success',
            'message' => 'Category created successfully.',
            'data'    => [
                'id'         => $category->id,
                'name'       => $category->category_name,
                'enabled'    => (bool) $category->is_enabled,
                'background' => $category->background_color,
                'font'       => $category->font_color,
            ],
        ], 201);
    }

    /**
     * PUT /pharmacy/categories/{id}
     * Update an existing category.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name'       => 'sometimes|string|max:255|unique:categories,category_name,' . $id,
            'enabled'    => 'sometimes|boolean',
            'background' => 'sometimes|string|max:20',
            'font'       => 'sometimes|string|max:20',
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

        $category->update($updateData);

        Cache::forget('admin_categories_all');

        return response()->json([
            'status'  => 'success',
            'message' => 'Category updated successfully.',
            'data'    => [
                'id'         => $category->id,
                'name'       => $category->category_name,
                'enabled'    => (bool) $category->is_enabled,
                'background' => $category->background_color,
                'font'       => $category->font_color,
            ],
        ]);
    }

    /**
     * DELETE /pharmacy/categories/{id}
     * Delete a category.
     */
    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->delete();

        Cache::forget('admin_categories_all');

        return response()->json([
            'status'  => 'success',
            'message' => 'Category deleted successfully.',
        ]);
    }
}
