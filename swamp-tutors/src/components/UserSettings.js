import React, { useState, useEffect } from "react";
import axios from "axios";

const UserSettings = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    courses: [],
  });
  const [newCourse, setNewCourse] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/user/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleNameEmailUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/user/settings",
        { name: userData.name, email: userData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Name and email updated successfully!");
    } catch (error) {
      setMessage("Failed to update name and email.");
      console.error("Error updating name and email:", error);
    }
  };

  const handleAddCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/user/settings/courses",
        { action: "add", courseName: newCourse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData((prev) => ({
        ...prev,
        courses: [...prev.courses, newCourse],
      }));
      setNewCourse("");
      setMessage("Course added successfully!");
    } catch (error) {
      setMessage("Failed to add course.");
      console.error("Error adding course:", error);
    }
  };

  const handleDeleteCourse = async (course) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/user/settings/courses",
        { action: "delete", courseName: course },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c !== course),
      }));
      setMessage("Course deleted successfully!");
    } catch (error) {
      setMessage("Failed to delete course.");
      console.error("Error deleting course:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">User Settings</h1>

      <div className="bg-white p-6 shadow-md rounded-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Update Name and Email</h2>
        <label className="block mb-2">
          Name:
          <input
            type="text"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            className="block w-full p-2 border border-gray-300 rounded-md"
          />
        </label>
        <label className="block mb-4">
          Email:
          <input
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            className="block w-full p-2 border border-gray-300 rounded-md"
          />
        </label>
        <button
          onClick={handleNameEmailUpdate}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Update
        </button>
      </div>

      <div className="bg-white p-6 shadow-md rounded-md">
        <h2 className="text-xl font-semibold mb-4">Courses Taken This Semester</h2>
        <div className="mb-4">
          {userData.courses.map((course, index) => (
            <span
              key={index}
              className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md mr-2 mb-2 inline-flex items-center"
            >
              {course}
              <button
                onClick={() => handleDeleteCourse(course)}
                className="ml-2 text-red-500"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            placeholder="Add new course"
            className="p-2 border border-gray-300 rounded-md mr-2"
          />
          <button
            onClick={handleAddCourse}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>

      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
};

export default UserSettings;


