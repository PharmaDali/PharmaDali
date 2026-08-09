import { apiRequest } from "../shared/api/apiClient";

/**
 * GET /pharmacy/settings
 * Fetch current pharmacy profile, operating hours, and alert thresholds.
 */
export const getPharmacySettings = async () => {
  const response = await apiRequest.get("/pharmacy/settings");
  return response.data;
};

/**
 * PUT /pharmacy/settings
 * Update pharmacy profile, operating hours, and/or alert thresholds.
 */
export const updatePharmacySettings = async (payload) => {
  const response = await apiRequest.put("/pharmacy/settings", payload);
  return response;
};

/**
 * POST /pharmacy/settings/logo
 * Upload a new pharmacy logo image file.
 */
export const uploadPharmacyLogo = async (file) => {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await apiRequest.post("/pharmacy/settings/logo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

/**
 * PATCH /pharmacy/settings/password
 * Update admin account password.
 */
export const updateAdminPassword = async (currentPassword, newPassword, newPasswordConfirmation) => {
  const response = await apiRequest.patch("/pharmacy/settings/password", {
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirmation: newPasswordConfirmation,
  });
  return response;
};

/**
 * GET /pharmacy/categories/all
 * Fetch all categories.
 */
export const getCategories = async () => {
  const response = await apiRequest.get("/pharmacy/categories/all");
  return response.data;
};

/**
 * POST /pharmacy/categories/store
 * Create a new category.
 */
export const createCategory = async (payload) => {
  const response = await apiRequest.post("/pharmacy/categories/store", payload);
  return response;
};

/**
 * PUT /pharmacy/categories/{id}
 * Update a category.
 */
export const updateCategory = async (id, payload) => {
  const response = await apiRequest.put(`/pharmacy/categories/${id}`, payload);
  return response;
};

/**
 * DELETE /pharmacy/categories/{id}
 * Delete a category.
 */
export const deleteCategory = async (id) => {
  const response = await apiRequest.delete(`/pharmacy/categories/${id}`);
  return response;
};
