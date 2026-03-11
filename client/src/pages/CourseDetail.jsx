import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseService } from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { addToCart, cart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await courseService.getCourseDetails(id);
                setCourse(res.data);
            } catch (err) {
                setError('Course not found');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    if (loading) return <div className="container">Loading course details...</div>;
    if (error) return <div className="container error">{error}</div>;

    // Check if purchased
    const isPurchased = user?.purchasedCourses?.includes(course._id) || course.enrolledStudents?.some(s => s._id === user?._id || s === user?._id);
    const inCart = cart.some(c => c._id === course._id);

    return (
        <div className="container" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
            <div style={{ flex: 2 }}>
                <h1>{course.title}</h1>
                <div style={{ marginBottom: '1rem' }}>
                    <span className="badge">{course.domain || "General"}</span>
                    <span style={{ marginLeft: '1rem', color: '#6b7280' }}>
                        Instructor: {course.instructor?.username || 'Unknown'}
                    </span>
                </div>

                {course.thumbnail && (
                    <div style={{
                        width: '100%',
                        height: '300px',
                        backgroundImage: `url(${course.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '8px',
                        marginTop: '1rem'
                    }}></div>
                )}

                <p style={{ fontSize: '1.2rem', margin: '2rem 0' }}>{course.description}</p>

                <h2>Course Content</h2>
                <div className="card" style={{ marginTop: '1rem', padding: '0' }}>
                    {course.videos && course.videos.length > 0 ? (
                        <ul style={{ listStyle: 'none' }}>
                            {course.videos.map((video, index) => (
                                <li
                                    key={index}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid #e5e7eb',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div>
                                        <span style={{ fontWeight: '500', marginRight: '1rem' }}>Lecture {index + 1}:</span>
                                        {video.title} {video.isDemo && <span className="badge" style={{ backgroundColor: '#fef08a', color: '#854d0e', marginLeft: '0.5rem' }}>Demo</span>}
                                    </div>
                                    <div>
                                        {isPurchased || video.isDemo ? (
                                            <Link to={`/courses/${course._id}/play?video=${index}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                                                Play
                                            </Link>
                                        ) : (
                                            <span style={{ color: '#9ca3af' }}>🔒 Locked</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ padding: '1rem' }}>No videos available for this course yet.</div>
                    )}
                </div>
            </div>

            <div style={{ flex: 1 }}>
                <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                    <h2>₹{course.price}</h2>

                    {user?.role !== 'admin' ? (
                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {isPurchased ? (
                                <Link to={`/courses/${course._id}/play`} className="btn btn-primary" style={{ width: '100%' }}>
                                    Go to Course
                                </Link>
                            ) : inCart ? (
                                <Link to="/cart" className="btn btn-secondary" style={{ width: '100%', backgroundColor: '#4b5563' }}>
                                    Go to Cart
                                </Link>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        addToCart(course);
                                        navigate('/cart');
                                    }}
                                >
                                    Add to Cart
                                </button>
                            )}

                            {!isPurchased && (
                                <button
                                    className="btn btn-secondary"
                                    style={{ width: '100%', background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login');
                                        } else {
                                            // Quick enroll/buy
                                            addToCart(course);
                                            navigate('/cart');
                                        }
                                    }}
                                >
                                    Buy Now
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>You are viewing this as an Admin.</p>
                        </div>
                    )}

                    <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
                        30-Day Money-Back Guarantee
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
