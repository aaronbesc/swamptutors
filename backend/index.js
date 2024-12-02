const express = require('express');
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

        res.status(201).json({ success: true, message: 'User created successfully.' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
});

app.get('/tutors', (req, res) => {
  db.all('SELECT id, name, email FROM users WHERE is_tutor = 1', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
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

const jwt = require('jsonwebtoken');

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

