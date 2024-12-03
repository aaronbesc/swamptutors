import React, { useState, useEffect } from "react";
import axios from "axios";

const UserSettings = () => {
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        courses: [],
        isTutor: false,
        isAvailable: false,
        tutoringCourses: [],
      });      
  const [newCourse, setNewCourse] = useState("");
  const [newTutoringCourse, setNewTutoringCourse] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:5000/user/settings", {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          setUserData({
            name: response.data.name,
            email: response.data.email,
            courses: response.data.courses || [],
            isTutor: response.data.isTutor || false,
            isAvailable: response.data.isAvailable || false,
            tutoringCourses: response.data.tutoringCourses || [],
          });
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

      <div className="bg-white p-6 rounded-t-md shadow-md">
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

      


      <div className="bg-white p-6 shadow-md mb-6 rounded-b-md">
  <h2 className="text-xl font-semibold mb-4">Tutor Settings</h2>

  <div className="mb-4">
    <label className="flex items-center">
      <input
        type="checkbox"
        checked={userData.isTutor}
        onChange={async (e) => {
          const isTutor = e.target.checked;
          try {
            const token = localStorage.getItem("token");
            await axios.put(
              "http://localhost:5000/user/settings/tutor",
              { isTutor, isAvailable: userData.isAvailable },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserData((prev) => ({ ...prev, isTutor }));
            setMessage("Tutor status updated successfully!");
          } catch (error) {
            setMessage("Failed to update tutor status.");
            console.error("Error updating tutor status:", error);
          }
        }}
        className="mr-2"
      />
      Are you a tutor?
    </label>
  </div>

  {userData.isTutor && (
    <>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={userData.isAvailable}
            onChange={async (e) => {
              const isAvailable = e.target.checked;
              try {
                const token = localStorage.getItem("token");
                await axios.put(
                  "http://localhost:5000/user/settings/tutor",
                  { isTutor: userData.isTutor, isAvailable },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                setUserData((prev) => ({ ...prev, isAvailable }));
                setMessage("Availability updated successfully!");
              } catch (error) {
                setMessage("Failed to update availability.");
                console.error("Error updating availability:", error);
              }
            }}
            className="mr-2"
          />
          Availability
        </label>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Courses Tutoring</h3>
        <div className="mb-4">
          {userData.tutoringCourses.map((course, index) => (
            <span
              key={index}
              className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md mr-2 mb-2 inline-flex items-center"
            >
              {course}
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    await axios.put(
                      "http://localhost:5000/user/settings/tutor/courses",
                      { action: "delete", courseName: course },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setUserData((prev) => ({
                      ...prev,
                      tutoringCourses: prev.tutoringCourses.filter((c) => c !== course),
                    }));
                    setMessage("Tutoring course deleted successfully!");
                  } catch (error) {
                    setMessage("Failed to delete tutoring course.");
                    console.error("Error deleting tutoring course:", error);
                  }
                }}
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
            value={newTutoringCourse}
            onChange={(e) => setNewTutoringCourse(e.target.value)}
            placeholder="Add new tutoring course"
            className="p-2 border border-gray-300 rounded-md mr-2"
          />
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                await axios.put(
                  "http://localhost:5000/user/settings/tutor/courses",
                  { action: "add", courseName: newTutoringCourse },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                setUserData((prev) => ({
                  ...prev,
                  tutoringCourses: [...prev.tutoringCourses, newTutoringCourse],
                }));
                setNewTutoringCourse("");
                setMessage("Tutoring course added successfully!");
              } catch (error) {
                setMessage("Failed to add tutoring course.");
                console.error("Error adding tutoring course:", error);
              }
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>
    </>
  )}
</div>





      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>


  );
};

export default UserSettings;


