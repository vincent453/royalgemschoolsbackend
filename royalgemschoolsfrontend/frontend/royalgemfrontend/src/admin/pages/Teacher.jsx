import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import TeacherCard from "../components/ui/TeachersCard";

const Teacher = () => {

  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchTeachers = async () => {
      try {

        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        // Filter only teachers
    const onlyTeachers = (data?.users || []).filter(
  (user) => user.role === "teacher"
);
        setTeachers(onlyTeachers);

      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();

  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">

      {/* Topbar */}
      <div className="sticky top-0 z-50 w-full">
        <Topbar />
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="-mt-16">
          <Slidebar />
        </div>

        {/* Main Content */}
        <main className="w-full overflow-y-auto p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-jost font-bold text-gray-800 text-2xl">
                Teachers
              </h1>

              <p className="font-dm-sans text-sm text-gray-400 mt-0.5">
                Manage all teachers and their roles
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/addUsers")}
              className="flex items-center gap-2 font-jost font-semibold px-6 py-2.5 rounded-full
                         bg-[#A033A0] hover:bg-[#525fe1] text-white text-sm
                         transition-colors duration-500 shadow-sm"
            >
              <FaPlus className="text-xs" />
              Add Teacher
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading teachers...
            </div>
          ) : teachers.length === 0 ? (

            /* No Teachers */
            <div className="text-center py-10 text-gray-500">
              No teachers found
            </div>

          ) : (

            /* Teacher Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

              {teachers.map((teacher) => (
                <TeacherCard
                  key={teacher._id}
                  name={teacher.name}
                  role={teacher.role}
                  subjects={[teacher.subjects || "No Subject"]}
                  photo={
                    teacher.profilePhoto ||
                    "https://i.pravatar.cc/150?img=8"
                  }
                />
              ))}

            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Teacher;