const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Helper function to log test results
const logTest = (testName, success, data = null) => {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${testName}`);
  if (data && success) {
    console.log(`   Result: ${JSON.stringify(data).substring(0, 100)}...`);
  }
  console.log('');
};

async function testAPI() {
  console.log('🧪 Testing BookShop API Endpoints');
  console.log('==================================\n');

  let authToken = null;
  let testUserId = null;

  // Test 1: Get all books
  try {
    const response = await axios.get(`${BASE_URL}/books`);
    logTest('Get all books', response.status === 200, `${response.data.length} books found`);
  } catch (error) {
    logTest('Get all books', false, error.message);
  }

  // Test 2: Get book by ISBN
  try {
    const response = await axios.get(`${BASE_URL}/books/isbn/978-0-13-444432-1`);
    logTest('Get book by ISBN', response.status === 200, response.data.title);
  } catch (error) {
    logTest('Get book by ISBN', false, error.message);
  }

  // Test 3: Get books by author
  try {
    const response = await axios.get(`${BASE_URL}/books/author/Robert C. Martin`);
    logTest('Get books by author', response.status === 200, `${response.data.length} books by Robert C. Martin`);
  } catch (error) {
    logTest('Get books by author', false, error.message);
  }

  // Test 4: Get books by title
  try {
    const response = await axios.get(`${BASE_URL}/books/title/Clean`);
    logTest('Get books by title', response.status === 200, `${response.data.length} books with "Clean" in title`);
  } catch (error) {
    logTest('Get books by title', false, error.message);
  }

  // Test 5: Register new user
  try {
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123'
    };
    const response = await axios.post(`${BASE_URL}/register`, userData);
    testUserId = response.data.userId;
    logTest('Register new user', response.status === 201, `User ID: ${testUserId}`);
  } catch (error) {
    logTest('Register new user', false, error.response?.data?.message || error.message);
  }

  // Test 6: Login user
  try {
    const loginData = {
      email: 'john@example.com',
      password: 'password123'
    };
    const response = await axios.post(`${BASE_URL}/login`, loginData);
    authToken = response.data.token;
    logTest('Login user', response.status === 200, `Token received: ${authToken ? 'Yes' : 'No'}`);
  } catch (error) {
    logTest('Login user', false, error.response?.data?.message || error.message);
  }

  // Test 7: Get book reviews
  try {
    const response = await axios.get(`${BASE_URL}/reviews/978-0-13-444432-1`);
    logTest('Get book reviews', response.status === 200, `${response.data.length} reviews found`);
  } catch (error) {
    logTest('Get book reviews', false, error.message);
  }

  // Protected route tests (require authentication)
  if (authToken) {
    const authHeaders = { headers: { Authorization: `Bearer ${authToken}` } };

    // Test 8: Add book review
    try {
      const reviewData = {
        isbn: '978-0-596-52068-7',
        rating: 5,
        comment: 'Excellent book! Highly recommended for JavaScript developers.'
      };
      const response = await axios.post(`${BASE_URL}/reviews`, reviewData, authHeaders);
      logTest('Add book review', response.status === 200, 'Review added successfully');
    } catch (error) {
      logTest('Add book review', false, error.response?.data?.message || error.message);
    }

    // Test 9: Get user reviews
    try {
      const response = await axios.get(`${BASE_URL}/user/reviews`, authHeaders);
      logTest('Get user reviews', response.status === 200, `${response.data.length} user reviews found`);
    } catch (error) {
      logTest('Get user reviews', false, error.message);
    }

    // Test 10: Delete book review
    try {
      const response = await axios.delete(`${BASE_URL}/reviews/978-0-596-52068-7`, authHeaders);
      logTest('Delete book review', response.status === 200, 'Review deleted successfully');
    } catch (error) {
      logTest('Delete book review', false, error.response?.data?.message || error.message);
    }
  } else {
    console.log('⚠️  Skipping protected route tests - no auth token available\n');
  }

  // Test error cases
  console.log('🔍 Testing Error Cases');
  console.log('====================\n');

  // Test invalid ISBN
  try {
    await axios.get(`${BASE_URL}/books/isbn/invalid-isbn`);
    logTest('Invalid ISBN (should fail)', false);
  } catch (error) {
    logTest('Invalid ISBN (should fail)', error.response?.status === 404, 'Correctly returned 404');
  }

  // Test unauthorized access
  try {
    await axios.post(`${BASE_URL}/reviews`, { isbn: '123', rating: 5, comment: 'test' });
    logTest('Unauthorized review (should fail)', false);
  } catch (error) {
    logTest('Unauthorized review (should fail)', error.response?.status === 401, 'Correctly returned 401');
  }

  console.log('🎉 API Testing Complete!');
  console.log('\n📊 Summary:');
  console.log('- All public endpoints tested');
  console.log('- Authentication flow tested');
  console.log('- Protected routes tested');
  console.log('- Error handling tested');
  console.log('\n🌐 Frontend available at: http://localhost:3000');
  console.log('🔧 Backend available at: http://localhost:5000');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testAPI };