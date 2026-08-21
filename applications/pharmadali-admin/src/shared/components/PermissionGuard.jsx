import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Checks if a user has permission to access a specific feature/route.
 * @param {Object} user 
 * @param {string} permissionKey 
 * @returns {boolean}
 */
export function checkUserPermission(user, permissionKey) {
  if (!user) return true;

  const role = user.role;
  if (role === "pharmacy_admin" || role === "admin" || role === "super_admin" || role === "system_admin") {
    return true;
  }

  if (role === "pharmacist") {
    // Strictly forbidden modules for pharmacists
    if (permissionKey === "view_dashboard" || permissionKey === "manage_settings" || permissionKey === "manage_pharmacists" || permissionKey === "view_analytics") {
      return false;
    }

    const defaultPermissions = ["access_pos", "access_pickup", "view_inventory", "view_sales_reports", "process_item_exchange"];
    const userPermissions = user.pharmacist?.permissions ?? defaultPermissions;

    return userPermissions.includes(permissionKey);
  }

  return false;
}

export default function PermissionGuard({ user, permission, children }) {
  const isAllowed = checkUserPermission(user, permission);

  if (!isAllowed) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm p-4 mx-auto" style={{ maxWidth: 500, borderRadius: 12 }}>
          <div className="mb-3 text-warning">
            <i className="fa-solid fa-triangle-exclamation fa-3x"></i>
          </div>
          <h4 className="fw-bold mb-2 text-dark">Access Restricted</h4>
          <p className="text-muted small mb-4">
            You do not have permission to view or manage this module. Please contact your Pharmacy Administrator if you require access.
          </p>
          <div>
            <button className="btn text-white px-4 py-2" style={{ backgroundColor: "#2aabe2" }} onClick={() => window.history.back()}>
              <i className="fa-solid fa-arrow-left me-2"></i> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
