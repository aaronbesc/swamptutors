import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    courses: "",
    isTutor: false,
    tutorCourses: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
        name: formData.name,
        email: formData.email,
        password: formData.password,
        courses: formData.courses.split(",").map((course) => course.trim()), // Split and trim "taken" courses
        tutorCourses: formData.tutorCourses.split(",").map((course) => course.trim()), // Split and trim "tutoring" courses
        is_tutor: formData.isTutor,
      });
  
      if (response.data.success) {
        // Save the token to local storage
        localStorage.setItem("token", response.data.token);
  
        // Set user state
        setUser({
          name: response.data.name,
          isTutor: response.data.is_tutor,
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
      <form
        className="bg-white p-8 shadow-md rounded-md w-96"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700">
            Full Name
          </label>
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
          <label htmlFor="email" className="block text-gray-700">
            Email
          </label>
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
          <label htmlFor="password" className="block text-gray-700">
            Password
          </label>
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
          <label htmlFor="courses" className="block text-gray-700">
            Courses (comma-separated)
          </label>
          <input
            type="text"
            id="courses"
            name="courses"
            value={formData.courses}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
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
          <label htmlFor="isTutor" className="text-gray-700">
            I want to be a tutor
          </label>
        </div>

        {formData.isTutor && (
          <div className="mb-4">
            <label htmlFor="tutorCourses" className="block text-gray-700">
              Courses to Tutor (comma-separated)
            </label>
            <input
              type="text"
              id="tutorCourses"
              name="tutorCourses"
              value={formData.tutorCourses}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Register
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default Register;

