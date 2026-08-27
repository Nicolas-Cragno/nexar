import { Navigate } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";
import Loading from "./Loading";

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
