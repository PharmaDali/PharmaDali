import { apiRequest, setAuthToken } from "../shared/api/apiClient";

const AUTH_TOKEN_KEY = "token";

export const login = async (credentials) => {
	const payload = {
		email: credentials?.email,
		password: credentials?.password,
	};

	const data = await apiRequest.post("/admin/login", payload);

	const token = data?.token || data?.access_token;
	if (token) {
		setAuthToken(token);
		if (data?.user?.pharmacy_id) {
			localStorage.setItem("pharmacy_id", data.user.pharmacy_id);
		}
	}

	return data;
};

export const getCurrentUser = async () => apiRequest.get("/user");

export const logout = async () => {
	try {
		await apiRequest.post("/logout");
	} finally {
		setAuthToken(null);
		localStorage.removeItem(AUTH_TOKEN_KEY);
		localStorage.removeItem("tokenExpiry");
		localStorage.removeItem("pharmacy_id");
	}
};
