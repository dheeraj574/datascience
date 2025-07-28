const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions to read/write JSON files
const readJsonFile = async (filename) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeJsonFile = async (filename, data) => {
  await fs.writeFile(path.join(__dirname, 'data', filename), JSON.stringify(data, null, 2));
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes for General Users

// 1. Get all books (Using async callback function)
app.get('/api/books', async (req, res) => {
  try {
    const books = await readJsonFile('books.json');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
});

// 2. Get book by ISBN (Using Promises)
app.get('/api/books/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  
  readJsonFile('books.json')
    .then(books => {
      const book = books.find(b => b.isbn === isbn);
      if (book) {
        res.json(book);
      } else {
        res.status(404).json({ message: 'Book not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: 'Error fetching book', error: error.message });
    });
});

// 3. Get books by Author
app.get('/api/books/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const books = await readJsonFile('books.json');
    const booksByAuthor = books.filter(book => 
      book.author.toLowerCase().includes(author.toLowerCase())
    );
    res.json(booksByAuthor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books by author', error: error.message });
  }
});

// 4. Get books by Title
app.get('/api/books/title/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const books = await readJsonFile('books.json');
    const booksByTitle = books.filter(book => 
      book.title.toLowerCase().includes(title.toLowerCase())
    );
    res.json(booksByTitle);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books by title', error: error.message });
  }
});

// 5. Get book reviews
app.get('/api/reviews/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const reviews = await readJsonFile('reviews.json');
    const bookReviews = reviews.filter(review => review.isbn === isbn);
    res.json(bookReviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// 6. Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const users = await readJsonFile('users.json');
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email || user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      registration_date: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    await writeJsonFile('users.json', users);

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// 7. Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = await readJsonFile('users.json');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login successful', 
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Routes for Registered Users

// 8. Add/Modify book review
app.post('/api/reviews', verifyToken, async (req, res) => {
  try {
    const { isbn, rating, comment } = req.body;
    
    if (!isbn || !rating || !comment) {
      return res.status(400).json({ message: 'ISBN, rating, and comment are required' });
    }

    const reviews = await readJsonFile('reviews.json');
    
    // Check if user already reviewed this book
    const existingReviewIndex = reviews.findIndex(
      review => review.isbn === isbn && review.user_id === req.user.userId
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      reviews[existingReviewIndex] = {
        ...reviews[existingReviewIndex],
        rating,
        comment,
        date: new Date().toISOString().split('T')[0]
      };
    } else {
      // Add new review
      const newReview = {
        id: uuidv4(),
        isbn,
        user_id: req.user.userId,
        username: req.user.username,
        rating,
        comment,
        date: new Date().toISOString().split('T')[0]
      };
      reviews.push(newReview);
    }

    await writeJsonFile('reviews.json', reviews);
    res.json({ message: 'Review saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving review', error: error.message });
  }
});

// 9. Delete book review
app.delete('/api/reviews/:isbn', verifyToken, async (req, res) => {
  try {
    const { isbn } = req.params;
    const reviews = await readJsonFile('reviews.json');
    
    const reviewIndex = reviews.findIndex(
      review => review.isbn === isbn && review.user_id === req.user.userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

    reviews.splice(reviewIndex, 1);
    await writeJsonFile('reviews.json', reviews);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

// Get user's reviews
app.get('/api/user/reviews', verifyToken, async (req, res) => {
  try {
    const reviews = await readJsonFile('reviews.json');
    const userReviews = reviews.filter(review => review.user_id === req.user.userId);
    res.json(userReviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user reviews', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});