import axios from 'axios';

// Create an Axios instance with the base URL of your backend
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Make sure this matches your backend URL precisely
  withCredentials: true, // This is CRITICAL for sending cookies
});

// Add a request interceptor to automatically attach the token
api.interceptors.request.use(
  (config) => {
    // Read the token from sessionStorage before every request
    const token = sessionStorage.getItem('token');

    // If token exists, attach it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Grouping auth-related API calls
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  forgotPassword: (data) => api.post('/auth/forgotpassword', data),
  resetPassword: (resetToken, data) => api.put(`/auth/resetpassword/${resetToken}`, data),
  getProfile: () => api.get('/auth/profile'),
  trackWatch: () => api.post('/auth/track-watch'),
  saveCart: (data) => api.post('/auth/cart', data),
};

// Grouping course-related API calls
export const courseService = {
  getAllCourses: (domain) => api.get(domain ? `/courses?domain=${domain}` : '/courses'),
  getAdminCourses: (domain, instructorId) => {
    let url = '/courses?';
    if (domain && domain !== 'All') url += `domain=${domain}&`;
    if (instructorId) url += `instructor=${instructorId}`;
    return api.get(url);
  },
  getCourseDetails: (courseId) => api.get(`/courses/${courseId}`),
  createCourse: (formData) => api.post('/courses/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  updateCourse: (courseId, formData) => api.put(`/courses/${courseId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteCourse: (courseId) => api.delete(`/courses/${courseId}`),
  enrollInCourse: (courseId) => api.post(`/courses/${courseId}/enroll`),
  getMyCourses: () => api.get('/courses/my-courses'),
};

export const paymentService = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify', data),
};

export default api;
