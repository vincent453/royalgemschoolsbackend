import { useState } from "react";
import { teachers } from "../../context/data/mockdata";

const TeacherTable = () => {
      const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
    const totalItems = teachers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentData = teachers.slice(startIndex, endIndex);
  return (
    <div className="bg-white p-5 rounded-md shadow-sm overflow-x-auto">
      <h2 className="font-bold text-gray-800 mb-4">
        Teacher Details
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="py-2">Name</th>
            <th>Subject</th>
            <th>Students</th>
            <th>Class</th>
            <th>Status</th> 
          </tr>
        </thead>

        <tbody>
        {currentData.map((teacher) => (
            <tr key={teacher.id} className="border-b">
            <td className="py-3">{teacher.name}</td>
            <td>{teacher.subject}</td>
            <td>{teacher.qualification}</td>
            <td>{teacher.fee}</td>
            </tr>
        ))}
        </tbody>
        <p className="text-sm text-gray-500 mt-3">
        Showing {startIndex + 1} to{" "}
        {Math.min(endIndex, totalItems)} of {totalItems} entries
        </p>
        <div className="flex gap-2 mt-3">
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((p) => p - 1)}
    className="px-3 py-1 border rounded disabled:opacity-50"
  >
    Prev
  </button>

  <button
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage((p) => p + 1)}
    className="px-3 py-1 border rounded disabled:opacity-50"
  >
    Next
  </button>
</div>
    </table>
    </div>
  );
};

export default TeacherTable;