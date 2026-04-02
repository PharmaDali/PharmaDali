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
	}

	return data;
};

export const getCurrentUser = async () => apiRequest.get("/admin/me");

export const logout = async () => {
	try {
		await apiRequest.post("/logout");
	} finally {
		setAuthToken(null);
		localStorage.removeItem(AUTH_TOKEN_KEY);
	}
};
