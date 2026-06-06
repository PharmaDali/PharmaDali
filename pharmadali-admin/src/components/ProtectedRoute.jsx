import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const tokenExpiry = localStorage.getItem("tokenExpiry");
  const isExpired = !tokenExpiry || Date.now() > Number(tokenExpiry);

  if (!isAuthenticated || isExpired) {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("tokenExpiry");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;