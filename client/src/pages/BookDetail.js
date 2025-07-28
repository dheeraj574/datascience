import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, reviewAPI } from '../services/api';

const BookDetail = () => {
  const { isbn } = useParams();
  const { isAuthenticated, user } = useAuth();
  
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    fetchBookAndReviews();
  }, [isbn]);

  const fetchBookAndReviews = async () => {
    try {
      setLoading(true);
      const [bookResponse, reviewResponse] = await Promise.all([
        bookAPI.getBookByISBN(isbn),
        reviewAPI.getReviews(isbn)
      ]);
      
      setBook(bookResponse.data);
      setReviews(reviewResponse.data);
    } catch (err) {
      setError('Failed to load book details. Please try again.');
      console.error('Error fetching book details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (reviewForm.rating === 0) {
      setReviewError('Please select a rating');
      return;
    }
    
    if (!reviewForm.comment.trim()) {
      setReviewError('Please write a review comment');
      return;
    }

    setReviewLoading(true);
    setReviewError('');

    try {
      await reviewAPI.addReview({
        isbn,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim()
      });
      
      setReviewSuccess('Review submitted successfully!');
      setReviewForm({ rating: 0, comment: '' });
      setShowReviewForm(false);
      
      // Refresh reviews
      const reviewResponse = await reviewAPI.getReviews(isbn);
      setReviews(reviewResponse.data);
      
      setTimeout(() => setReviewSuccess(''), 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await reviewAPI.deleteReview(isbn);
      setReviewSuccess('Review deleted successfully!');
      
      // Refresh reviews
      const reviewResponse = await reviewAPI.getReviews(isbn);
      setReviews(reviewResponse.data);
      
      setTimeout(() => setReviewSuccess(''), 3000);
    } catch (err) {
      setReviewError('Failed to delete review');
    }
  };

  const renderStars = (rating, interactive = false, onClick = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'active' : ''}`}
        onClick={interactive ? () => onClick(index + 1) : undefined}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >
        ★
      </span>
    ));
  };

  const userReview = reviews.find(review => review.user_id === user?.id);
  const otherReviews = reviews.filter(review => review.user_id !== user?.id);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!book) {
    return <div className="error-message">Book not found</div>;
  }

  return (
    <div className="book-detail-container">
      {/* Book Information */}
      <div className="card">
        <div className="book-detail-header">
          <img 
            src={book.cover_image || 'https://via.placeholder.com/200x280/cccccc/666666?text=No+Image'} 
            alt={book.title}
            className="book-detail-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x280/cccccc/666666?text=No+Image';
            }}
          />
          <div className="book-detail-info">
            <h1>{book.title}</h1>
            <h2>by {book.author}</h2>
            <p className="book-meta">
              <strong>ISBN:</strong> {book.isbn}<br />
              <strong>Publisher:</strong> {book.publisher}<br />
              <strong>Publication Date:</strong> {book.publication_date}<br />
              <strong>Pages:</strong> {book.pages}<br />
              <strong>Genre:</strong> {book.genre}
            </p>
            <p className="book-description">{book.description}</p>
            <div className="book-price">
              <span className="price">${book.price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {reviewSuccess && <div className="success-message">{reviewSuccess}</div>}
      {reviewError && <div className="error-message">{reviewError}</div>}

      {/* Reviews Section */}
      <div className="review-section">
        <div className="review-header">
          <h3>Reviews ({reviews.length})</h3>
          
          {isAuthenticated() && !userReview && (
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="form-button"
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
            >
              {showReviewForm ? 'Cancel' : 'Write Review'}
            </button>
          )}
        </div>

        {/* User's existing review */}
        {userReview && (
          <div className="user-review card">
            <div className="review-header">
              <h4>Your Review</h4>
              <button 
                onClick={handleDeleteReview}
                className="delete-button"
                style={{ 
                  background: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
            <div className="review-rating">{renderStars(userReview.rating)}</div>
            <p className="review-comment">{userReview.comment}</p>
            <p className="review-date">Posted on {userReview.date}</p>
          </div>
        )}

        {/* Review Form */}
        {isAuthenticated() && showReviewForm && !userReview && (
          <div className="review-form card">
            <h4>Write a Review</h4>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="rating-input">
                  {renderStars(reviewForm.rating, true, (rating) => 
                    setReviewForm({ ...reviewForm, rating })
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="comment" className="form-label">Comment</label>
                <textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="review-textarea"
                  placeholder="Share your thoughts about this book..."
                  rows="4"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="form-button"
                disabled={reviewLoading}
                style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {/* Login prompt for non-authenticated users */}
        {!isAuthenticated() && (
          <div className="card text-center">
            <p>Please <a href="/login" className="text-primary">login</a> to write a review.</p>
          </div>
        )}

        {/* Other Reviews */}
        {otherReviews.length > 0 && (
          <div className="reviews-list">
            <h4>Other Reviews</h4>
            {otherReviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div>
                    <span className="review-author">{review.username}</span>
                    <div className="review-rating">{renderStars(review.rating)}</div>
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {reviews.length === 0 && (
          <div className="card text-center">
            <p>No reviews yet. Be the first to review this book!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;