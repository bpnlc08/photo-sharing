import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiresAuth, requiredRole, fallbackRoute = "/consumer" }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  if (requiresAuth) {
    if (!token || !user) {
      return <Navigate to="/signin" />;
    }

    if (requiredRole) {
      const hasRequiredRole = user?.roles?.[requiredRole] === true;
      if (!hasRequiredRole) {
        return <Navigate to={fallbackRoute} />;
      }
    }

    return children;
  } else {
    if (token && user) {
        
      if (user?.roles?.creator === true) {
        return <Navigate to="/creator" />;
      } else if (user?.roles?.consumer === true) {
        return <Navigate to="/consumer" />;
      } else {
        return <Navigate to="/consumer" />;
      }
        
    }
    return children;
  }
}
