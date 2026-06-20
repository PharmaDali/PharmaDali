<?php

namespace App\Multitenancy;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Spatie\Multitenancy\Contracts\IsTenant;
use Spatie\Multitenancy\TenantFinder\TenantFinder;

class PharmacyHeaderTenantFinder extends TenantFinder
{
    /**
     * Resolve the current tenant from the request.
     *
     * Priority:
     *  1. The authenticated user's pharmacy_id (for pharmacy_admin / pharmacist).
     *  2. The X-Pharmacy-ID header (for customer-facing flows where the user
     *     has selected a specific pharmacy).
     */
    public function findForRequest(Request $request): ?IsTenant
    {
        $user = $request->user();
        $headerPharmacyId = $request->header('X-Pharmacy-ID');

        // For Pharmacy Admins and Pharmacists, validate that their assigned
        // pharmacy_id matches the header if it was provided. Reject mismatches.
        if ($user && $user->pharmacy_id) {
            if ($headerPharmacyId && (int) $headerPharmacyId !== (int) $user->pharmacy_id) {
                abort(403, 'Tenant mismatch: The requested pharmacy does not match your assigned pharmacy.');
            }
            
            return Tenant::find($user->pharmacy_id);
        }

        // Customers don't have a fixed pharmacy_id — they choose one per session via the header.
        if (!$headerPharmacyId) {
            return null;
        }

        return Tenant::find((int) $headerPharmacyId);
    }
}
