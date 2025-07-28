const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// 1. Get all books – Using async callback function
const getAllBooksCallback = (callback) => {
  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/books`);
      callback(null, response.data);
    } catch (error) {
      callback(error, null);
    }
  };
  
  fetchBooks();
};

// 2. Search by ISBN – Using Promises
const searchByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/books/isbn/${isbn}`)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
};

// 3. Search by Author – Using async/await
const searchByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/books/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 4. Search by Title – Using async/await
const searchByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/books/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Example usage functions
const demonstrateMethods = () => {
  console.log('=== Demonstrating Book Search Methods ===\n');

  // 1. Testing callback method
  console.log('1. Getting all books using callback:');
  getAllBooksCallback((error, books) => {
    if (error) {
      console.error('Error:', error.message);
    } else {
      console.log(`Found ${books.length} books`);
      console.log('First book:', books[0]?.title || 'No books found');
    }
    console.log('');
  });

  // 2. Testing Promise method
  console.log('2. Searching by ISBN using Promises:');
  searchByISBN('978-0-13-444432-1')
    .then(book => {
      console.log('Found book:', book.title);
      console.log('Author:', book.author);
    })
    .catch(error => {
      console.error('Error:', error.message);
    })
    .finally(() => {
      console.log('');
    });

  // 3. Testing async/await for author search
  const testAuthorSearch = async () => {
    console.log('3. Searching by Author using async/await:');
    try {
      const books = await searchByAuthor('Robert C. Martin');
      console.log(`Found ${books.length} books by Robert C. Martin`);
      books.forEach(book => console.log(`- ${book.title}`));
    } catch (error) {
      console.error('Error:', error.message);
    }
    console.log('');
  };

  // 4. Testing async/await for title search
  const testTitleSearch = async () => {
    console.log('4. Searching by Title using async/await:');
    try {
      const books = await searchByTitle('Clean');
      console.log(`Found ${books.length} books with "Clean" in title`);
      books.forEach(book => console.log(`- ${book.title}`));
    } catch (error) {
      console.error('Error:', error.message);
    }
    console.log('');
  };

  // Execute async functions
  setTimeout(testAuthorSearch, 1000);
  setTimeout(testTitleSearch, 2000);
};

module.exports = {
  getAllBooksCallback,
  searchByISBN,
  searchByAuthor,
  searchByTitle,
  demonstrateMethods
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateMethods();
}