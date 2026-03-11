import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authService } from '../services/api';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { resettoken } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setLoading(true);
            setError('');
            await authService.resetPassword(resettoken, { password });

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container form-container" style={{ marginTop: '4rem', textAlign: 'center' }}>
                <h2 style={{ color: '#16a34a' }}>Password Reset Successful!</h2>
                <p>You can now log in with your new password.</p>
                <p>Redirecting to login...</p>
                <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="container form-container" style={{ marginTop: '4rem', maxWidth: '500px' }}>
            <h2>Reset Password</h2>
            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        minLength="6"
                    />
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        minLength="6"
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
