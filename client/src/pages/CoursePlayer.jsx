import { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { authService, courseService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const CoursePlayer = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const initialVideoIndex = parseInt(searchParams.get('video')) || 0;

    const [course, setCourse] = useState(null);
    const [currentVideo, setCurrentVideo] = useState(initialVideoIndex);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await courseService.getCourseDetails(id);
                const data = res.data;
                setCourse(data);

                // If a video is specified in URL but locked, redirect back to course page
                const isInstructor = user?.role === 'admin' && data.instructor?._id === user?._id;
                const isPurchased = isInstructor || user?.purchasedCourses?.includes(data._id) || data.enrolledStudents?.some(s => s._id === user?._id || s === user?._id);

                if (data.videos && data.videos[initialVideoIndex]) {
                    if (!isPurchased && !data.videos[initialVideoIndex].isDemo) {
                        alert("Please purchase the course to view this lecture.");
                        navigate(`/courses/${id}`);
                    }
                }

                // Track watch progress
                if (user) {
                    try {
                        await authService.trackWatch();
                    } catch (trackErr) {
                        console.error("Failed to track watch progress", trackErr);
                    }
                }
            } catch (err) {
                setError('Failed to load course content');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, initialVideoIndex, user, navigate]);

    if (loading) return <div className="container">Loading player...</div>;
    if (error) return <div className="container error">{error}</div>;

    // Instructors should be able to view their own courses. Admins generally should too.
    const isInstructor = user?.role === 'admin' && course?.instructor?._id === user?._id;
    const isPurchased = isInstructor || user?.purchasedCourses?.includes(course?._id) || course?.enrolledStudents?.some(s => s._id === user?._id || s === user?._id);

    const handleVideoSelect = (index, video) => {
        if (isPurchased || video.isDemo) {
            setCurrentVideo(index);
        } else {
            alert("This video is locked. Please purchase the course to continue viewing!");
            navigate(`/courses/${course._id}`);
        }
    };

    const currentVideoData = course.videos && course.videos[currentVideo];

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 70px)', margin: '-2rem', backgroundColor: '#111827', color: 'white' }}>

            {/* Video Area */}
            <div style={{ flex: 3, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {currentVideoData ? (
                        <video
                            src={currentVideoData.videoUrl}
                            controls
                            autoPlay
                            style={{ width: '100%', height: '100%', maxHeight: '80vh' }}
                            poster="https://images.unsplash.com/photo-1616422285623-138982ce1aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                        >
                            Your browser does not support HTML video.
                        </video>
                    ) : (
                        <div>No video selected or available.</div>
                    )}
                </div>
                <div style={{ padding: '2rem' }}>
                    <h2>{currentVideoData?.title || 'Unknown Lecture'}</h2>
                    <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>{course.title}</p>
                </div>
            </div>

            {/* Sidebar / Syllabus */}
            <div style={{ flex: 1, backgroundColor: '#1f2937', borderLeft: '1px solid #374151', overflowY: 'auto' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #374151' }}>
                    <h3 style={{ margin: 0 }}>Course Content</h3>
                </div>

                {course.videos && course.videos.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {course.videos.map((video, index) => {
                            const isActive = index === currentVideo;
                            const isLocked = !isPurchased && !video.isDemo;

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleVideoSelect(index, video)}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        cursor: isLocked ? 'not-allowed' : 'pointer',
                                        backgroundColor: isActive ? '#374151' : 'transparent',
                                        borderLeft: isActive ? '4px solid #60a5fa' : '4px solid transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Lecture {index + 1}</span>
                                        <span style={{ color: isLocked ? '#9ca3af' : 'white', marginTop: '0.25rem' }}>
                                            {video.title}
                                        </span>
                                    </div>
                                    <div>
                                        {video.isDemo && !isPurchased && <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', backgroundColor: '#fbbf24', color: '#854d0e', borderRadius: '4px' }}>Demo</span>}
                                        {isLocked && <span style={{ opacity: 0.5 }}>🔒</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ padding: '1.5rem', color: '#9ca3af' }}>No lectures available.</div>
                )}
            </div>

        </div>
    );
};

export default CoursePlayer;
