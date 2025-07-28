import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, reviewAPI } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserReviews();
  }, []);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserReviews();
      setUserReviews(response.data);
    } catch (err) {
      setError('Failed to load your reviews.');
      console.error('Error fetching user reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (isbn) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewAPI.deleteReview(isbn);
      // Remove the deleted review from the list
      setUserReviews(userReviews.filter(review => review.isbn !== isbn));
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'active' : ''}`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* User Info */}
      <div className="card">
        <h2>Profile</h2>
        <div className="user-info">
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Member since:</strong> {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* User Reviews */}
      <div className="user-reviews-section">
        <h3>Your Reviews ({userReviews.length})</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        {userReviews.length > 0 ? (
          <div className="reviews-list">
            {userReviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div>
                    <h4>Review for ISBN: {review.isbn}</h4>
                    <div className="review-rating">{renderStars(review.rating)}</div>
                  </div>
                  <div className="review-actions">
                    <span className="review-date">{review.date}</span>
                    <button 
                      onClick={() => handleDeleteReview(review.isbn)}
                      className="delete-button"
                      style={{ 
                        background: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginLeft: '1rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center">
            <p>You haven't written any reviews yet.</p>
            <p><a href="/search" className="text-primary">Search for books</a> to start reviewing!</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="card">
        <h3>Your Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{userReviews.length}</span>
            <span className="stat-label">Reviews Written</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {userReviews.length > 0 
                ? (userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length).toFixed(1)
                : '0'
              }
            </span>
            <span className="stat-label">Average Rating Given</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;