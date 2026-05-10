<?php

namespace App\Services\Forecast;

use App\Models\Forecast;
use App\Models\User;

class ForecastQueryService
{
    public function listForBranch(User $user, array $filters): array
    {
        if (!$user->branch_id) {
            return [];
        }

        $query = Forecast::query()->where('tenant_id', $user->branch_id);

        if (!empty($filters['kind'])) {
            $query->where('kind', $filters['kind']);
        }

        if (!empty($filters['granularity'])) {
            $query->where('granularity', $filters['granularity']);
        }

        if (!empty($filters['period'])) {
            $query->where('period', $filters['period']);
        }

        $limit = $filters['limit'] ?? 100;

        return $query
            ->orderByDesc('ds')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}
