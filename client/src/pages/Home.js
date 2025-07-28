import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import { bookAPI } from '../services/api';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookAPI.getAllBooks();
      setBooks(response.data);
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="hero-section text-center mb-2">
        <h1>Welcome to BookShop</h1>
        <p>Discover amazing programming books and share your thoughts</p>
      </div>

      <div className="books-section">
        <h2>Featured Books ({books.length})</h2>
        {books.length > 0 ? (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.isbn} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>No books available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;