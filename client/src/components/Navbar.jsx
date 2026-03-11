import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
    const { user } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" style={{
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 1000,
                    fontSize: '2.2rem',
                    background: 'linear-gradient(135deg, #0fbaeeff, #4062abff, #474aeeff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                }}>
                    <span style={{ fontSize: '2rem', color: '#406c93ff', WebkitTextFillColor: 'initial' }}>● </span><span style={{ marginLeft: '-0.3rem' }}>CourseHub</span>
                </Link>
            </div>

            <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <Link to="/admin" style={{ color: '#f59e0b', fontWeight: 'bold' }}>Instructor Dashboard</Link>
                        )}
                        <Link to="/courses" style={{ color: location.pathname === '/courses' ? 'var(--primary-color)' : '' }}>All Courses</Link>
                        <Link to="/my-courses" style={{ color: location.pathname === '/my-courses' ? 'var(--primary-color)' : '' }}>My Courses</Link>
                        {user.role !== 'admin' && (
                            <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: location.pathname === '/cart' ? 'var(--primary-color)' : '' }}>
                                Cart
                                {cart.length > 0 && (
                                    <span style={{
                                        position: 'relative',
                                        top: '-8px',
                                        right: '-4px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        borderRadius: '50%',
                                        padding: '0.1rem 0.4rem',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        lineHeight: 1
                                    }}>
                                        {cart.length}
                                    </span>
                                )}
                            </Link>
                        )}
                        <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', borderRadius: '4px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'none' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            Profile
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/courses">Courses</Link>
                        <Link to="/cart" style={{ display: 'flex', alignItems: 'center' }}>
                            Cart
                            {cart.length > 0 && (
                                <span style={{
                                    marginLeft: '4px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    borderRadius: '50%',
                                    padding: '0.1rem 0.4rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                }}>
                                    {cart.length}
                                </span>
                            )}
                        </Link>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', boxShadow: 'none' }}>Login</Link>
                        <Link to="/signup" className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', boxShadow: 'none' }}>Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
