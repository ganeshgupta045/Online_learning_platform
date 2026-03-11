import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const DOMAINS = ["All", "General", "Artificial Intelligence", "Web Development", "Data Science", "Mobile Development"];

const AdminDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeDomain, setActiveDomain] = useState("All");

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Form states for Create/Edit Course (Admin Only)
    const [isEditing, setIsEditing] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [newCourse, setNewCourse] = useState({ title: '', description: '', domain: 'General', price: 0 });
    const [lectures, setLectures] = useState([{ title: '', file: null, isDemo: true, existingUrl: '' }]);
    const [createMsg, setCreateMsg] = useState('');

    const fetchCourses = async (domain = null) => {
        try {
            setLoading(true);
            const queryDomain = domain === "All" ? null : domain;
            const res = await courseService.getAdminCourses(queryDomain, user?._id);
            setCourses(res.data);
        } catch (err) {
            setError('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/courses');
            return;
        }
        fetchCourses(activeDomain);
    }, [activeDomain, user, navigate]);

    // Handle lecture inputs dynamically
    const handleLectureChange = (index, field, value) => {
        const updatedLectures = [...lectures];
        updatedLectures[index][field] = value;
        setLectures(updatedLectures);
    };

    const addLectureField = () => {
        setLectures([...lectures, { title: '', file: null, isDemo: false, existingUrl: '' }]);
    };

    const removeLectureField = (index) => {
        const updatedLectures = [...lectures];
        updatedLectures.splice(index, 1);
        setLectures(updatedLectures);
    };

    // Determine if form should be shown. Show if editing, or if explicitly creating new, or if 0 courses exist.
    const hasCourses = courses.length > 0;
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Auto-show form if they have no courses (and not loading/error)
    useEffect(() => {
        if (!loading && !error && courses.length === 0) {
            setShowCreateForm(true);
        }
    }, [loading, error, courses.length]);

    const handleEditClick = (course) => {
        setIsEditing(true);
        setShowCreateForm(true);
        setEditingCourseId(course._id);
        setNewCourse({
            title: course.title,
            description: course.description,
            domain: course.domain,
            price: course.price
        });

        // Map existing videos into the lecture state blocks
        if (course.videos && course.videos.length > 0) {
            setLectures(course.videos.map(v => ({
                title: v.title,
                file: null, // Files can't be pre-filled securely, they have to re-upload if they want to change the video specifically
                isDemo: v.isDemo,
                existingUrl: v.videoUrl
            })));
        } else {
            setLectures([]);
        }

        // Scroll smoothly to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingCourseId(null);
        setNewCourse({ title: '', description: '', domain: 'General', price: 0 });
        setLectures([{ title: '', file: null, isDemo: true, existingUrl: '' }]);
        setCreateMsg('');
        if (courses.length > 0) {
            setShowCreateForm(false);
        }
    }

    const handleCreateOrUpdateCourse = async (e) => {
        e.preventDefault();
        try {
            setCreateMsg(isEditing ? 'Updating course...' : 'Uploading course and videos... this may take a moment.');

            const formData = new FormData();
            formData.append('title', newCourse.title);
            formData.append('description', newCourse.description);
            formData.append('domain', newCourse.domain);
            formData.append('price', newCourse.price);

            const lectureTitles = [];
            const isDemos = [];
            const existingVideos = [];

            for (let i = 0; i < lectures.length; i++) {
                const lec = lectures[i];
                // If there's an existing URL and no new file, it means they are keeping the old video
                if (lec.existingUrl && !lec.file) {
                    existingVideos.push({
                        title: lec.title,
                        videoUrl: lec.existingUrl,
                        isDemo: lec.isDemo
                    });
                } else if (lec.file) {
                    // It's a brand new upload (either adding a new lecture or replacing an old one)
                    formData.append('videos', lec.file);
                    lectureTitles.push(lec.title);
                    isDemos.push(lec.isDemo);
                }
            }

            // Append metadata for new file uploads
            if (lectureTitles.length > 0) {
                formData.append('lectureTitles', JSON.stringify(lectureTitles));
                formData.append('isDemos', JSON.stringify(isDemos));
            }

            // Append existing videos object so they aren't deleted on backend
            if (isEditing) {
                formData.append('existingVideos', JSON.stringify(existingVideos));
            }

            if (isEditing) {
                await courseService.updateCourse(editingCourseId, formData);
                setCreateMsg('Course updated successfully!');
            } else {
                await courseService.createCourse(formData);
                setCreateMsg('Course created successfully!');
            }

            // reset form
            setIsEditing(false);
            setEditingCourseId(null);
            setNewCourse({ title: '', description: '', domain: 'General', price: 0 });
            setLectures([{ title: '', file: null, isDemo: true, existingUrl: '' }]);

            // If they just created their first course, we can keep the form showing or hide it.
            // Let's hide it to show them their new course grid.
            setShowCreateForm(false);

            fetchCourses(activeDomain);
        } catch (err) {
            setCreateMsg(err.response?.data?.message || err.message || 'Failed to process request');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course entirely? This cannot be undone.")) return;
        try {
            await courseService.deleteCourse(courseId);
            fetchCourses(activeDomain);
        } catch (err) {
            alert('Failed to delete course');
            console.error(err);
        }
    }

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Instructor Dashboard</h1>
                {courses.length > 0 && !showCreateForm && (
                    <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
                        + Create New Course
                    </button>
                )}
            </div>

            {/* Admin Controls */}
            {showCreateForm && (
                <div className="card form-container" style={{ margin: '0 auto 3rem auto', maxWidth: '800px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>{isEditing ? 'Edit Course' : 'Create New Course'}</h3>
                        {courses.length > 0 && (
                            <button onClick={cancelEdit} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>Cancel ✕</button>
                        )}
                    </div>
                    {createMsg && <p className={createMsg.includes('failed') ? "error" : "success"}>{createMsg}</p>}
                    <form onSubmit={handleCreateOrUpdateCourse}>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                required
                                value={newCourse.title}
                                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Domain / Category</label>
                            <select
                                value={newCourse.domain}
                                onChange={(e) => setNewCourse({ ...newCourse, domain: e.target.value })}
                            >
                                {DOMAINS.filter(d => d !== "All").map(domain => (
                                    <option key={domain} value={domain}>{domain}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Price (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={newCourse.price}
                                onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                required
                                value={newCourse.description}
                                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                style={{ minHeight: '100px' }}
                            />
                        </div>

                        {/* Dynamic Lecture Inputs */}
                        <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: 'white' }}>
                            <h4 style={{ margin: '0 0 1rem 0' }}>Course Syllabus (Lectures)</h4>

                            {lectures.map((lecture, index) => (
                                <div key={index} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '4px', position: 'relative' }}>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLectureField(index)}
                                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            ✕ Remove
                                        </button>
                                    )}
                                    <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                        <label>Lecture {index + 1} Title</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Introduction to React"
                                            value={lecture.title}
                                            onChange={(e) => handleLectureChange(index, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                        <label>Video File {lecture.existingUrl && '(Optional: Upload new to replace)'}</label>
                                        <input
                                            type="file"
                                            required={!lecture.existingUrl}
                                            accept="video/mp4,video/x-m4v,video/*"
                                            onChange={(e) => handleLectureChange(index, 'file', e.target.files[0])}
                                            style={{ padding: '0.5rem', border: '1px solid #ccc', width: '100%' }}
                                        />
                                        {lecture.existingUrl && (
                                            <small style={{ display: 'block', marginTop: '0.25rem', color: '#16a34a' }}>
                                                ✓ Existing video in place ({lecture.existingUrl.split('/').pop()})
                                            </small>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            id={`demo-${index}`}
                                            checked={lecture.isDemo}
                                            onChange={(e) => handleLectureChange(index, 'isDemo', e.target.checked)}
                                        />
                                        <label htmlFor={`demo-${index}`} style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563' }}>Set as Free Demo</label>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addLectureField}
                                className="btn btn-secondary"
                                style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#e2e8f0', color: '#475569' }}
                            >
                                + Add Another Lecture
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                marginTop: '2rem',
                                backgroundColor: isEditing ? '#10b981' : undefined
                            }}
                            disabled={createMsg.includes('Uploading') || createMsg.includes('Updating')}
                        >
                            {createMsg.includes('Update')
                                ? 'Updating...'
                                : createMsg.includes('Uploading')
                                    ? 'Uploading...'
                                    : isEditing ? 'Save Changes' : 'Publish Course'}
                        </button>
                    </form>
                </div>
            )}

            {/* Course Discovery Section for Editing/Deleting */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Manage Existing Courses</h2>
                        <p style={{ color: '#4b5563', margin: 0 }}>Select a course to edit or delete from the database.</p>
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

                {/* Course Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Loading courses...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : courses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No Courses Yet</h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            {activeDomain === "All"
                                ? "You haven't created any courses yet. Start your journey as an instructor by creating your first course above!"
                                : `You haven't created any courses in the "${activeDomain}" category.`}
                        </p>
                        {activeDomain === "All" && (
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="btn btn-primary"
                            >
                                Create Your First Course
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="courses-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {courses.map((course) => (
                            <div key={course._id} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* Course Thumbnail Image */}
                                    <div style={{ height: '160px', backgroundColor: '#e5e7eb', backgroundImage: `url(${course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

                                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: 'bold', lineHeight: '1.4' }}>
                                            {course.title.length > 50 ? course.title.substring(0, 50) + '...' : course.title}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{course.domain}</span>
                                        </div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
                                            ₹{course.price}
                                        </div>

                                        {/* Admin Quick Actions */}
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                            <button
                                                onClick={() => handleEditClick(course)}
                                                style={{ flex: 1, padding: '0.5rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold' }}
                                            >
                                                ✎ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCourse(course._id)}
                                                style={{ flex: 1, padding: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold' }}
                                            >
                                                🗑 Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
