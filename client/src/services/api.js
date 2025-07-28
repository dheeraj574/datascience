import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Book API methods
export const bookAPI = {
  // Get all books
  getAllBooks: () => api.get('/books'),
  
  // Get book by ISBN
  getBookByISBN: (isbn) => api.get(`/books/isbn/${isbn}`),
  
  // Get books by author
  getBooksByAuthor: (author) => api.get(`/books/author/${encodeURIComponent(author)}`),
  
  // Get books by title
  getBooksByTitle: (title) => api.get(`/books/title/${encodeURIComponent(title)}`),
  
  // Get book reviews
  getBookReviews: (isbn) => api.get(`/reviews/${isbn}`),
};

// User API methods
export const userAPI = {
  // Register new user
  register: (userData) => api.post('/register', userData),
  
  // Login user
  login: (credentials) => api.post('/login', credentials),
  
  // Get user reviews
  getUserReviews: () => api.get('/user/reviews'),
};

// Review API methods
export const reviewAPI = {
  // Add/Update review
  addReview: (reviewData) => api.post('/reviews', reviewData),
  
  // Delete review
  deleteReview: (isbn) => api.delete(`/reviews/${isbn}`),
  
  // Get reviews for a book
  getReviews: (isbn) => api.get(`/reviews/${isbn}`),
};

export default api;