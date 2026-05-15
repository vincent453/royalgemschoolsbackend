import { useState } from "react";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import ParentsDetailsForm from "../components/ui/ParentDetailsForm";
import StudentDetailsForm from "../components/ui/StudentDetailsForm";

const AddStudent = () => {
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    classLevel: "",
    session: "",
    regNumber: "",
    gender: "",
    dateOfBirth: "",
    placeOfBirth: "",   // ✅ was missing
    address: "",
    profilePhoto: null, // ✅ was missing
  });

  const [parentForm, setParentForm] = useState({
    parentFirstName: "",
    parentLastName: "",
    parentPhone: "",
    parentEmail: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const formData = new FormData();

      // Append student fields — skip profilePhoto (file), handle it separately
      Object.entries(studentForm).forEach(([key, value]) => {
        if (key !== "profilePhoto") {
          formData.append(key, value ?? "");
        }
      });

      // ✅ Append file only once, and only if it exists
      if (studentForm.profilePhoto) {
        formData.append("profilePhoto", studentForm.profilePhoto);
      }

      // Append parent fields
      Object.entries(parentForm).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });

      const response = await fetch("http://localhost:5000/api/students", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❗ Do NOT set Content-Type — browser sets it automatically with boundary for FormData
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess("Student uploaded successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#E6EBEE] overflow-hidden">
      {/* Topbar */}
      <div className="sticky top-0 z-50 w-full">
        <Topbar />
      </div>

      {/* Below topbar: sidebar + content */}
      <div className="flex flex-1 overflow-y-scroll h-full rounded-r-2xl shadow-sm">
        <div className="-mt-16">
          <Slidebar />
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-10 space-y-6">
          <StudentDetailsForm form={studentForm} setForm={setStudentForm} />

          <ParentsDetailsForm form={parentForm} setForm={setParentForm} />

          <div className="space-y-2">
            {error && (
              <div className="bg-red-100 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium">
                {success}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-3 text-white rounded-xl transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#A13EA1] hover:bg-[#8a328a]"
            }`}
          >
            {loading ? "Uploading..." : "Upload Student"}
          </button>
        </main>
      </div>
    </div>
  );
};

export default AddStudent;