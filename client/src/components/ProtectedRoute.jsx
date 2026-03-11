import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    // Pull both user and token to ensure strict security
    const { user, token } = useContext(AuthContext);

    // If there's no token or no user, they aren't authenticated
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // If a route requires a specific role (like admin) and user doesn't match
    if (requiredRole && user.role !== requiredRole) {
        // Redirect non-admins trying to access admin routes back to courses
        return <Navigate to="/courses" replace />;
    }

    // User is authenticated and authorized, render the protected component
    return children;
};

export default ProtectedRoute;
