import React, { useState } from 'react';
import BookCard from '../components/BookCard';
import { bookAPI } from '../services/api';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      let response;
      
      switch (searchType) {
        case 'isbn':
          response = await bookAPI.getBookByISBN(searchQuery.trim());
          setResults(response.data ? [response.data] : []);
          break;
        case 'author':
          response = await bookAPI.getBooksByAuthor(searchQuery.trim());
          setResults(response.data);
          break;
        case 'title':
          response = await bookAPI.getBooksByTitle(searchQuery.trim());
          setResults(response.data);
          break;
        default:
          throw new Error('Invalid search type');
      }
      
      setSearched(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setResults([]);
        setSearched(true);
      } else {
        setError('Search failed. Please try again.');
        console.error('Search error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setResults([]);
    setError('');
    setSearched(false);
  };

  return (
    <div className="search-container">
      <div className="card">
        <h2>Search Books</h2>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Enter ${searchType === 'isbn' ? 'ISBN' : searchType}...`}
            className="search-input"
          />
          
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            className="search-select"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="isbn">ISBN</option>
          </select>
          
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          
          {searched && (
            <button type="button" onClick={handleReset} className="search-button">
              Reset
            </button>
          )}
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>

      {searched && (
        <div className="search-results">
          <h3>
            Search Results ({results.length})
            {searchQuery && (
              <span className="text-primary"> for "{searchQuery}"</span>
            )}
          </h3>
          
          {results.length > 0 ? (
            <div className="books-grid">
              {results.map((book) => (
                <BookCard key={book.isbn} book={book} />
              ))}
            </div>
          ) : (
            <div className="card text-center">
              <p>No books found matching your search criteria.</p>
              <p>Try searching with different keywords or search type.</p>
            </div>
          )}
        </div>
      )}

      <div className="search-help card">
        <h4>Search Tips:</h4>
        <ul>
          <li><strong>Title:</strong> Search by book title (partial matches work)</li>
          <li><strong>Author:</strong> Search by author name (partial matches work)</li>
          <li><strong>ISBN:</strong> Search by exact ISBN number</li>
        </ul>
        
        <h4>Sample Searches:</h4>
        <ul>
          <li><strong>Title:</strong> "Clean", "JavaScript", "Pragmatic"</li>
          <li><strong>Author:</strong> "Robert", "Martin", "Fowler"</li>
          <li><strong>ISBN:</strong> "978-0-13-444432-1"</li>
        </ul>
      </div>
    </div>
  );
};

export default Search;