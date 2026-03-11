import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            // We only fetch stats if user exists from context, the API will use cookie
            if (!user) return;
            try {
                setLoading(true);
                const res = await authService.getProfile();
                setProfileData(res.data);
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>Loading profile...</div>;
    if (error) return <div className="container error">{error}</div>;
    if (!profileData || !user) return null;

    const { courseCount, watchedDaysCount } = profileData;

    return (
        <div className="container" style={{ maxWidth: '600px', marginTop: '3rem' }}>
            <div className="card" style={{ padding: '3rem', textAlign: 'center', borderTop: '4px solid var(--primary-color)' }}>
                {/* Profile Avatar / Icon */}
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    color: 'black',
                    border: '2px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    margin: '0 auto 1.5rem auto',
                    fontWeight: 'bold'
                }}>
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>

                <h1 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>{user.username}</h1>
                <p style={{ color: '#185fc4ff', fontSize: '1.1rem', marginBottom: '2rem' }}>{user.email}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                            {courseCount}
                        </div>
                        <div style={{ color: '#64748b', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                            {user.role === 'admin' ? 'Courses Created' : 'Enrolled Courses'}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
                            {watchedDaysCount}
                        </div>
                        <div style={{ color: '#64748b', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                            Learning Streak (Days)
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                    style={{ width: '100%', backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;
