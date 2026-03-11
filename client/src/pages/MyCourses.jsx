import { useState, useEffect, useContext } from 'react';
import { courseService } from '../services/api';

import { AuthContext } from '../context/AuthContext';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                setLoading(true);
                const res = await courseService.getMyCourses();
                setCourses(res.data);
            } catch (err) {
                setError('Failed to fetch your courses.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, []);

    if (loading) return <div className="container">Loading your courses...</div>;
    if (error) return <div className="container error">{error}</div>;

    const isAdmin = user?.role === 'admin';

    return (
        <div className="container">
            <h2>{isAdmin ? 'My Created Courses' : 'My Enrolled Courses'}</h2>
            <div className="courses-grid">
                {courses.length === 0 ? (
                    <p>{isAdmin ? "You haven't created any courses yet." : "You haven't enrolled in any courses yet."}</p>
                ) : (
                    courses.map((course) => (
                        <div key={course._id || course.id} className="card">
                            <h3>{course.title}</h3>
                            <p>{course.description}</p>
                            <span className="badge">{isAdmin ? 'Created by You' : 'Enrolled'}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyCourses;
