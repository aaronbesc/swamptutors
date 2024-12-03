import React, { useEffect, useState } from "react";
import axios from "axios";

const Homepage = ({ user, setUser }) => {
  const [tutors, setTutors] = useState([]);

  // Fetch available tutors
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/tutors", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTutors(response.data); // Set tutors directly from the backend response
      } catch (error) {
        console.error("Error fetching tutors:", error);
      }
    };

    fetchTutors();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    setUser(null); // Clear user state
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4 flex justify-between">
        <h1>Welcome, {user.name}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </header>
      <main className="p-8">
        <h2 className="text-xl font-bold mb-4">Available Tutors</h2>
        {tutors.length > 0 ? (
          <ul>
            {tutors.map((tutor) => (
              <li key={tutor.id} className="bg-white p-4 shadow-md rounded-md mb-4">
                <h3 className="font-bold">{tutor.name}</h3>
                <p>Email: {tutor.email}</p>
                <p>
                  Subjects:{" "}
                  {tutor.courses && tutor.courses.length > 0
                    ? tutor.courses.join(", ")
                    : "No subjects available"}
                </p>
                <p>
                  Availability:{" "}
                  {tutor.is_available ? "Available" : "Not Available"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tutors available at the moment.</p>
        )}
      </main>
    </div>
  );
};

export default Homepage;

