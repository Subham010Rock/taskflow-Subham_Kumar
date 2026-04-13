const pool = require('../config/db');

const userRepository = {
  
  // Find a user by their email address
  // Used by: Login (to check credentials)
  // Used by: Register (to check if email already exists)
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT id, name, email, password, created_at FROM users WHERE email = \$1',
      [email]
    );
    return result.rows[0] || null;
  },

  // Find a user by their ID
  // Used by: Getting user info from JWT payload
  async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = \$1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Create a new user
  // Used by: Register
  async create(name, email, hashedPassword) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password) 
       VALUES (\$1, \$2, \$3) 
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );
    return result.rows[0];
  },
};

module.exports = userRepository;