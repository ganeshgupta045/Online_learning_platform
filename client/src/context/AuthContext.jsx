import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // Initialize state DIRECTLY from sessionStorage so user is not null on page refresh
    // This prevents ProtectedRoute from kicking the user out before useEffect runs
    const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Function to handle login success
    const login = (userData, jwtToken) => {
        // 1. Save to sessionStorage
        sessionStorage.setItem('token', jwtToken);
        sessionStorage.setItem('user', JSON.stringify(userData));

        // 2. Save to State
        setToken(jwtToken);
        setUser(userData);

        // 3. Redirect to courses
        navigate('/courses');
    };

    // Function to handle logout
    const logout = () => {
        // 1. Remove from sessionStorage
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

        // 2. Clear State
        setToken(null);
        setUser(null);

        // 3. Redirect to login
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
