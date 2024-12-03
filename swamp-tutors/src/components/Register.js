import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    isTutor: false,
  });

  const [coursesTaken, setCoursesTaken] = useState([]);
  const [newCourseTaken, setNewCourseTaken] = useState("");

  const [coursesTutoring, setCoursesTutoring] = useState([]);
  const [newCourseTutoring, setNewCourseTutoring] = useState("");

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleAddCourse = (type) => {
    if (type === "taken" && newCourseTaken) {
      setCoursesTaken([...coursesTaken, newCourseTaken]);
      setNewCourseTaken("");
    } else if (type === "tutoring" && newCourseTutoring) {
      setCoursesTutoring([...coursesTutoring, newCourseTutoring]);
      setNewCourseTutoring("");
    }
  };

  const handleRemoveCourse = (type, course) => {
    if (type === "taken") {
      setCoursesTaken(coursesTaken.filter((c) => c !== course));
    } else if (type === "tutoring") {
      setCoursesTutoring(coursesTutoring.filter((c) => c !== course));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.endsWith("@ufl.edu")) {
      setMessage("Please use a @ufl.edu email address.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/register", {
        ...formData,
        coursesTaken,
        coursesTutoring,
      });

      if (response.data.success) {
        // Save the token to local storage
        localStorage.setItem("token", response.data.token);

        // Set user state
        setUser({
          name: response.data.name,
          isTutor: response.data.isTutor,
        });

        // Redirect to the dashboard
        navigate("/dashboard");
      } else {
        setMessage("Registration failed.");
      }
    } catch (error) {
      setMessage(error.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form className="bg-white p-8 shadow-md rounded-md w-96" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Courses Taken</h3>
          <div className="mb-4">
            {coursesTaken.map((course, index) => (
              <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md mr-2 mb-2 inline-flex items-center">
                {course}
                <button
                  type="button"
                  onClick={() => handleRemoveCourse("taken", course)}
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
              value={newCourseTaken}
              onChange={(e) => setNewCourseTaken(e.target.value)}
              placeholder="Add new course"
              className="p-2 border border-gray-300 rounded-md mr-2"
            />
            <button
              type="button"
              onClick={() => handleAddCourse("taken")}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isTutor"
            name="isTutor"
            checked={formData.isTutor}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="isTutor" className="text-gray-700">I want to be a tutor</label>
        </div>

        {formData.isTutor && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Courses Tutoring</h3>
            <div className="mb-4">
              {coursesTutoring.map((course, index) => (
                <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md mr-2 mb-2 inline-flex items-center">
                  {course}
                  <button
                    type="button"
                    onClick={() => handleRemoveCourse("tutoring", course)}
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
                value={newCourseTutoring}
                onChange={(e) => setNewCourseTutoring(e.target.value)}
                placeholder="Add new course"
                className="p-2 border border-gray-300 rounded-md mr-2"
              />
              <button
                type="button"
                onClick={() => handleAddCourse("tutoring")}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                +
              </button>
            </div>
          </div>
        )}

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">Register</button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default Register;
