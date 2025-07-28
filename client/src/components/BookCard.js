import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book/${book.isbn}`);
  };

  return (
    <div className="book-card" onClick={handleClick}>
      <img 
        src={book.cover_image || '/api/placeholder/100/140'} 
        alt={book.title}
        className="book-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/100x140/cccccc/666666?text=No+Image';
        }}
      />
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <p className="book-description">
          {book.description?.length > 150 
            ? `${book.description.substring(0, 150)}...` 
            : book.description
          }
        </p>
        <div className="book-footer">
          <span className="book-price">${book.price}</span>
          <span className="book-pages">{book.pages} pages</span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;