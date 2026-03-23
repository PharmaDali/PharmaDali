<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\BranchRequest;
use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class BranchController extends Controller
{
    use AuthorizesRequests;

    /**
    * Display a listing of the resource.
    */
    public function index()
    {
        $branches = Branch::all();
        return response()->json($branches);
    }

    /**
    * Store a newly created resource in storage.
    */
    public function store(BranchRequest $request): JsonResponse
    {
        $branch = Branch::create($request->validated());

        return response()->json([
            'message' => 'Branch created',
            'branch' => $branch,
        ], 201);
    }

    /**
    * Display the specified resource.
    */
    public function show(string $id)
    {
        $branch = Branch::findOrFail($id);
        return response()->json($branch);
    }

    /**
    * Update the specified resource in storage.
    */
    public function update(Request $request, string $id)
    {
        $branch = Branch::findOrFail($id);
        $branch->update($request->validated());

        return response()->json([
            'message' => 'Branch updated',
            'branch' => $branch,
        ]);
    }

    /**
    * Remove the specified resource from storage.
    */
    public function destroy(Branch $branch)
    {
        $this->authorize('delete', $branch);

        if ($branch->employees()->exists()) {
            return response()->json([
                'message' => 'Cannot delete branch with employees'
            ], 400);
        }

        $branch->delete();

        return response()->noContent();
    }
}
