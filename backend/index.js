const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

app.listen(5000, () => console.log('Server running on http://localhost:5000'));

app.get('/', (req, res) => {
  res.send('Backend Server is Running!');
});

const db = require('./db');


// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach user data to request
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

app.get('/test-db', (req, res) => {
  db.all('SELECT name FROM sqlite_master WHERE type="table"', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ tables: rows });
  });
});

app.post('/register', async (req, res) => {
  const { name, email, password, is_tutor, courses } = req.body;

  try {
    // Check if email already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (row) {
        return res.status(400).json({ error: 'Email is already registered.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        'INSERT INTO users (name, email, password, is_tutor) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, is_tutor],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'User creation failed: ' + err.message });
          }

          const userId = this.lastID;

          // Insert courses for the user
          courses.forEach((course) => {
            db.run(
              'INSERT INTO courses (user_id, course_name, type) VALUES (?, ?, ?)',
              [userId, course, is_tutor ? 'tutoring' : 'taken']
            );
          });

          // Generate JWT token
          const token = jwt.sign(
            { id: userId, email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );

          res.status(201).json({
            success: true,
            message: 'User created successfully.',
            token,
            name,
            is_tutor,
          });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
});


app.get('/tutors', authenticate, (req, res) => {
  const { email } = req.user; // Email of the logged-in user from JWT

  db.all(
    `SELECT u.id, u.name, u.email, u.is_available, GROUP_CONCAT(c.course_name) AS courses 
     FROM users u 
     LEFT JOIN courses c ON u.id = c.user_id 
     WHERE u.is_tutor = 1 AND u.email != ? 
     GROUP BY u.id`,
    [email],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch tutors: ' + err.message });
      }

      const tutors = rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        is_available: row.is_available,
        courses: row.courses ? row.courses.split(",") : [], // Parse courses into an array
      }));

      res.json(tutors);
    }
  );
});






app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get('/courses', (req, res) => {
  db.all('SELECT * FROM courses', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error retrieving courses: ' + err.message });
    }
    res.json(rows);
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET, // Ensure this line is correctly accessing the secret
      { expiresIn: '1h' }
    );

    res.json({ token, name: user.name, is_tutor: user.is_tutor });
  });
});

