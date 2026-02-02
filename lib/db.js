// Database connection configuration
// This file is maintained for compatibility but the application uses Firebase instead of PostgreSQL
console.warn('PostgreSQL is not being used - application uses Firebase for certificate storage');

// Create a mock pool object to prevent import errors
const pool = {
  query: (text, params) => {
    return Promise.reject(new Error('PostgreSQL is not configured. Use Firebase instead.'));
  }
};

module.exports = { pool };