import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Homepage from "./components/Homepage";
import UserSettings from './components/UserSettings';

function App() {
  const [user, setUser] = useState(null); // Manage logged-in user state

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/dashboard"
          element={user ? <Homepage user={user} setUser={setUser} /> : <Home />}
        />
        <Route path="/settings" element={<UserSettings user={user} setUser={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;




