import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    // Bring in the login function from Context
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');

            // Call the login API
            const response = await authService.login(formData);

            // Extract exactly what your backend returns
            const token = response.data.token;
            const user = response.data.user;

            if (!token || !user) {
                throw new Error('Invalid response from server (missing token or user)');
            }

            // Pass them exactly to the context login function
            login(user, token);

            // Navigation is already handled inside the context's login function, 
            // but if you remove it from there, you can do it here:
            // navigate('/courses');

        } catch (err) {
            console.error('Login error:', err);
            // Optional chaining to safely extract backend error messages
            setError(
                err.response?.data?.message ||
                err.message ||
                'Login failed. Please verify your credentials.'
            );
        }
    };

    return (
        <div className="container form-container">
            <h2>Login</h2>
            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <button type="submit" className="btn btn-primary">Login</button>
            </form>

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <Link to="/forgotpassword" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', textDecoration: 'none' }}>
                    Forgot your password?
                </Link>
                <p style={{ margin: 0 }}>
                    Don't have an account? <Link to="/signup">Sign up here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
