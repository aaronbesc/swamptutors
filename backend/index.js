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
  const { name, email, password, isTutor, coursesTaken, coursesTutoring } = req.body;

  try {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (row) {
        return res.status(400).json({ error: 'Email is already registered.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        'INSERT INTO users (name, email, password, is_tutor) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, isTutor],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'User creation failed: ' + err.message });
          }

          const userId = this.lastID;

          // Insert "courses taken"
          coursesTaken.forEach((course) => {
            db.run('INSERT INTO courses (user_id, course_name, type) VALUES (?, ?, ?)', [userId, course, 'taken']);
          });

          // Insert "courses tutoring"
          if (isTutor) {
            coursesTutoring.forEach((course) => {
              db.run('INSERT INTO courses (user_id, course_name, type) VALUES (?, ?, ?)', [userId, course, 'tutoring']);
            });
          }

          // Generate JWT token
          const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

          res.status(201).json({ success: true, message: 'User created successfully.', token });
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
    `SELECT u.id, u.name, u.email, u.is_available, 
            GROUP_CONCAT(c.course_name) AS courses
     FROM users u 
     LEFT JOIN courses c 
       ON u.id = c.user_id AND c.type = 'tutoring' -- Only include tutoring courses
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

// Endpoint to fetch user details
app.get('/user/settings', authenticate, (req, res) => {
  const { id } = req.user; // Extract user ID from the JWT

  db.get(
    `SELECT id, name, email, is_tutor AS isTutor, is_available AS isAvailable 
     FROM users WHERE id = ?`,
    [id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch user details: ' + err.message });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Fetch "courses taken"
      db.all(
        `SELECT course_name FROM courses WHERE user_id = ? AND type = 'taken'`,
        [id],
        (err, takenCourses) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch taken courses: ' + err.message });
          }

          // Fetch "courses tutoring"
          db.all(
            `SELECT course_name FROM courses WHERE user_id = ? AND type = 'tutoring'`,
            [id],
            (err, tutoringCourses) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to fetch tutoring courses: ' + err.message });
              }

              res.json({
                ...user,
                courses: takenCourses.map((course) => course.course_name),
                tutoringCourses: tutoringCourses.map((course) => course.course_name),
              });
            }
          );
        }
      );
    }
  );
});


// Endpoint to update name and email
app.put('/user/settings', authenticate, (req, res) => {
  const { id } = req.user; // Extract user ID from JWT
  const { name, email } = req.body;

  db.run(
    `UPDATE users SET name = ?, email = ? WHERE id = ?`,
    [name, email, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update user details: ' + err.message });
      }
      res.json({ success: true, message: 'User details updated successfully.' });
    }
  );
});

// Endpoint to manage "courses taken"
app.put('/user/settings/courses', authenticate, (req, res) => {
  const { id } = req.user; // Extract user ID from JWT
  const { action, courseName } = req.body;

  if (action === 'add') {
    db.run(
      `INSERT INTO courses (user_id, course_name, type) VALUES (?, ?, 'taken')`,
      [id, courseName],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to add course: ' + err.message });
        }
        res.json({ success: true, message: 'Course added successfully.' });
      }
    );
  } else if (action === 'delete') {
    db.run(
      `DELETE FROM courses WHERE user_id = ? AND course_name = ? AND type = 'taken'`,
      [id, courseName],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete course: ' + err.message });
        }
        res.json({ success: true, message: 'Course deleted successfully.' });
      }
    );
  } else {
    res.status(400).json({ error: 'Invalid action.' });
  }
});

// Endpoint to update tutor status and availability
app.put('/user/settings/tutor', authenticate, (req, res) => {
  const { id } = req.user;
  const { isTutor, isAvailable } = req.body;

  db.run(
    `UPDATE users SET is_tutor = ?, is_available = ? WHERE id = ?`,
    [isTutor ? 1 : 0, isAvailable ? 1 : 0, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update tutor status: ' + err.message });
      }
      res.json({ success: true, message: 'Tutor status updated successfully.' });
    }
  );
});

// Endpoint to manage "courses tutoring"
app.put('/user/settings/tutor/courses', authenticate, (req, res) => {
  const { id } = req.user;
  const { action, courseName } = req.body;

  if (action === 'add') {
    db.run(
      `INSERT INTO courses (user_id, course_name, type) VALUES (?, ?, 'tutoring')`,
      [id, courseName],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to add tutoring course: ' + err.message });
        }
        res.json({ success: true, message: 'Tutoring course added successfully.' });
      }
    );
  } else if (action === 'delete') {
    db.run(
      `DELETE FROM courses WHERE user_id = ? AND course_name = ? AND type = 'tutoring'`,
      [id, courseName],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete tutoring course: ' + err.message });
        }
        res.json({ success: true, message: 'Tutoring course deleted successfully.' });
      }
    );
  } else {
    res.status(400).json({ error: 'Invalid action.' });
  }
});

app.put('/user/settings/password', authenticate, (req, res) => {
  const { id } = req.user; // Extract user ID from the JWT
  const { currentPassword, newPassword } = req.body;

  // Fetch the current password hash from the database
  db.get(`SELECT password FROM users WHERE id = ?`, [id], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch user data: ' + err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Compare the current password with the stored hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    db.run(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update password: ' + err.message });
        }
        res.json({ success: true, message: 'Password updated successfully.' });
      }
    );
  });
});




