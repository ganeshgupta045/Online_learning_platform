import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setMessage('');
            const res = await authService.forgotPassword({ email });
            setMessage(res.data.message || 'If that email is registered, we have sent a password reset link.');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container form-container" style={{ marginTop: '4rem', maxWidth: '500px' }}>
            <h2>Forgot Password</h2>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
                Enter your email address and we will send you a link to reset your password.
            </p>

            {error && <div className="error">{error}</div>}
            {message && <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{message}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>
                    &larr; Back to Login
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
