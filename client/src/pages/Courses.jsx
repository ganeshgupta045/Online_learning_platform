import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const DOMAINS = ["All", "General", "Artificial Intelligence", "Web Development", "Data Science", "Mobile Development"];

const carouselImages = [
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
];

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeDomain, setActiveDomain] = useState("All");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [priceFilter, setPriceFilter] = useState('All');
    const [instructorFilter, setInstructorFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Newest');

    const { user } = useContext(AuthContext);
    const { addToCart, cart } = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
        }, 2500); // 2.5 seconds
        return () => clearInterval(timer);
    }, []);

    const fetchCourses = async (domain = null) => {
        try {
            setLoading(true);
            const queryDomain = domain === "All" ? null : domain;
            const res = await courseService.getAllCourses(queryDomain);
            setCourses(res.data);
        } catch (err) {
            setError('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses(activeDomain);
        // Reset filters when changing domains to avoid empty states
        setSearchQuery('');
        setPriceFilter('All');
        setInstructorFilter('All');
    }, [activeDomain]);

    // Extract unique instructors for the dropdown
    const uniqueInstructors = Array.from(new Set(courses.map(c => c.instructor?.username).filter(Boolean)));

    // Apply Filters & Sorting
    const getFilteredAndSortedCourses = () => {
        let result = [...courses];

        // 1. Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(course =>
                course.title.toLowerCase().includes(query) ||
                (course.description && course.description.toLowerCase().includes(query))
            );
        }

        // 2. Price Filter
        if (priceFilter !== 'All') {
            if (priceFilter === 'Free') result = result.filter(c => c.price === 0);
            if (priceFilter === 'Under ₹1000') result = result.filter(c => c.price > 0 && c.price < 1000);
            if (priceFilter === '₹1000 - ₹3000') result = result.filter(c => c.price >= 1000 && c.price <= 3000);
            if (priceFilter === 'Over ₹3000') result = result.filter(c => c.price > 3000);
        }

        // 3. Instructor Filter
        if (instructorFilter !== 'All') {
            result = result.filter(c => c.instructor?.username === instructorFilter);
        }

        // 4. Sorting
        if (sortBy === 'Price: Low to High') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Price: High to Low') {
            result.sort((a, b) => b.price - a.price);
        }
        // If 'Newest' just leave as is (assuming MongoDB natural ordering or timeline based fetching)

        return result;
    };

    const filteredCourses = getFilteredAndSortedCourses();

    return (
        <div style={{ marginTop: '2rem' }}>
            {/* Hero Carousel Section */}
            <div
                style={{
                    color: 'white',
                    padding: '6rem 2rem',
                    borderRadius: '8px',
                    marginBottom: '3rem',
                    textAlign: 'center',
                    backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.7), rgba(17, 24, 39, 0.7)), url(${carouselImages[currentImageIndex]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'background-image 1s ease-in-out',
                    minHeight: '350px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <h1 style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Learn Without Limits</h1>
                <p style={{ fontSize: '1.25rem', color: '#f3f4f6', maxWidth: '600px', margin: '0 auto', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                    Build skills with courses, certificates, and degrees online from world-class universities and companies.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '2rem' }}>
                    {carouselImages.map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: currentImageIndex === idx ? 'white' : 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s'
                            }}
                            onClick={() => setCurrentImageIndex(idx)}
                        />
                    ))}
                </div>
            </div>

            {/* Course Discovery Section */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>A broad selection of courses</h2>
                        <p style={{ color: '#4b5563', margin: 0 }}>Choose from online video courses with new additions published every month</p>
                    </div>
                </div>

                {/* Domain Tabs */}
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    {DOMAINS.map(domain => (
                        <button
                            key={domain}
                            onClick={() => setActiveDomain(domain)}
                            style={{
                                padding: '0.75rem 1.25rem',
                                border: 'none',
                                background: activeDomain === domain ? 'var(--primary-color)' : 'transparent',
                                color: activeDomain === domain ? 'white' : 'var(--text-color)',
                                fontWeight: 'bold',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            {domain}
                        </button>
                    ))}
                </div>

                {/* Advanced Filter Bar */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    border: '1px solid var(--border-color)',
                    alignItems: 'center'
                }}>
                    <div style={{ flex: '1 1 250px' }}>
                        <input
                            type="text"
                            placeholder="🔍 Search courses by title or topic..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontFamily: 'inherit',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', cursor: 'pointer' }}
                        >
                            <option value="All">All Prices</option>
                            <option value="Free">Free</option>
                            <option value="Under ₹1000">Under ₹1000</option>
                            <option value="₹1000 - ₹3000">₹1000 - ₹3000</option>
                            <option value="Over ₹3000">Over ₹3000</option>
                        </select>

                        {uniqueInstructors.length > 0 && (
                            <select
                                value={instructorFilter}
                                onChange={(e) => setInstructorFilter(e.target.value)}
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', cursor: 'pointer' }}
                            >
                                <option value="All">All Instructors</option>
                                {uniqueInstructors.map(inst => (
                                    <option key={inst} value={inst}>{inst}</option>
                                ))}
                            </select>
                        )}

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', cursor: 'pointer', fontWeight: '500' }}
                        >
                            <option value="Newest">Sort: Newest</option>
                            <option value="Price: Low to High">Price: Low to High</option>
                            <option value="Price: High to Low">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Course Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Loading courses...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : filteredCourses.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                        No courses match your active filters. Try clearing your search or adjusting the price/instructor dropdowns.
                    </p>
                ) : (
                    <div className="courses-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {filteredCourses.map((course) => {
                            const isPurchased = user?.purchasedCourses?.includes(course._id) || course.enrolledStudents?.some(s => s._id === user?._id || s === user?._id);
                            const inCart = cart.some(c => c._id === course._id);

                            return (
                                <div key={course._id} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <Link
                                        to={`/courses/${course._id}`}
                                        className="card"
                                        style={{ textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', padding: 0, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        {/* Course Thumbnail Image */}
                                        <div style={{ height: '160px', backgroundColor: '#e5e7eb', backgroundImage: `url(${course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

                                        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: 'bold', lineHeight: '1.4' }}>
                                                {course.title.length > 50 ? course.title.substring(0, 50) + '...' : course.title}
                                            </h3>
                                            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem', flex: 'none' }}>
                                                {course.instructor?.username || 'Unknown Instructor'}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 'bold', color: '#b4690e' }}>4.8</span>
                                                <span style={{ color: '#eab308' }}>★★★★☆</span>
                                                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>(1,234)</span>
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
                                                ₹{course.price}
                                            </div>

                                            {/* Action Button (Hidden for Admins) */}
                                            {user?.role !== 'admin' && (
                                                <div style={{ marginTop: 'auto' }}>
                                                    {isPurchased ? (
                                                        <button className="btn btn-secondary" style={{ width: '100%' }}>Go to Course</button>
                                                    ) : (
                                                        <button
                                                            className={`btn ${inCart ? 'btn-secondary' : 'btn-primary'}`}
                                                            style={{ width: '100%', backgroundColor: inCart ? '#4b5563' : '' }}
                                                            onClick={(e) => {
                                                                e.preventDefault(); // prevent triggering the Link
                                                                if (inCart) {
                                                                    navigate('/cart');
                                                                } else {
                                                                    addToCart(course);
                                                                }
                                                            }}
                                                        >
                                                            {inCart ? 'In Cart' : 'Add to cart'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
