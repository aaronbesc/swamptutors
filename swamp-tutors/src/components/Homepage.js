import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Homepage = ({ user, setUser }) => {
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    const fetchTutors = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/tutors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTutors(response.data);
    };
    fetchTutors();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4 flex justify-between">
        <h1>Welcome, {user.name}</h1>
        <div>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">
        <h2 className="text-xl font-bold mb-4">Available Tutors</h2>
        <ul>
          {tutors.map((tutor) => (
            <li key={tutor.id} className="bg-white p-4 shadow-md rounded-md mb-4">
              <h3 className="font-bold">{tutor.name}</h3>
              <p>Email: {tutor.email}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Homepage;
