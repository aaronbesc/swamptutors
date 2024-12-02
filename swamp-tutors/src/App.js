import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Homepage from './components/Homepage';

function App() {
  const [user, setUser] = useState(null); // Manage logged-in user state

  return (
    <Router>
      <Routes>
        {/* Registration Route */}
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" />}
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />}
        />

        {/* Homepage Route */}
        <Route
          path="/"
          element={user ? <Homepage user={user} setUser={setUser} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;


