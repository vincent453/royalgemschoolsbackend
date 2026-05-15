import { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResultTable = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  // ── Fetch results from backend ──
  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/results", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // ── Delete result ──
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this result?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/results/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Remove from state without refetching
      setResults((prev) => prev.filter((r) => r._id !== id));
      setOpenMenuId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  // ── Pagination ──
  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = results.slice(startIndex, startIndex + itemsPerPage);

  // ── Status badge color ──
  const statusColor = (status) =>
    status === "Pass"
      ? "bg-green-100 text-green-600"
      : "bg-red-100 text-red-500";

  // ── Grade badge color ──
  const gradeColor = (grade) => {
    if (grade === "A") return "bg-green-100 text-green-600";
    if (grade === "B") return "bg-blue-100 text-blue-600";
    if (grade === "C") return "bg-yellow-100 text-yellow-600";
    if (grade === "D") return "bg-orange-100 text-orange-600";
    return "bg-red-100 text-red-500";
  };

  // ── Overall grade from average ──
  const getOverallGrade = (average) => {
    if (average >= 70) return "A";
    if (average >= 60) return "B";
    if (average >= 50) return "C";
    if (average >= 40) return "D";
    return "F";
  };

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-center h-48">
        <p className="text-gray-400 text-sm">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-center h-48">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Header */}
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="py-3"><input type="checkbox" /></th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Term</th>
              <th>Session</th>
              <th>Total</th>
              <th>Average</th>
              <th>Status</th>
              <th>Grade</th>
              <th>Action</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-gray-400">
                  No results found
                </td>
              </tr>
            ) : (
              currentData.map((item) => {
                const overallGrade = getOverallGrade(Number(item.average));
                return (
                  <tr key={item._id} className="border-b hover:bg-gray-50">

                    {/* Checkbox */}
                    <td><input type="checkbox" /></td>

                    {/* Name + Photo */}
                    <td className="py-4 flex items-center gap-3">
                      {item.student?.profilePhoto ? (
                        <img
                          src={item.student.profilePhoto}
                          className="w-10 h-10 rounded-full object-cover"
                          alt={item.student?.firstName}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#A033A0] font-bold text-sm">
                          {item.student?.firstName?.[0]}{item.student?.lastName?.[0]}
                        </div>
                      )}
                      <span className="font-medium text-gray-700">
                        {item.student?.firstName} {item.student?.lastName}
                      </span>
                    </td>

                    {/* Class */}
                    <td className="text-[#A033A0] font-medium">
                      {item.student?.classLevel}
                    </td>

                    {/* Term */}
                    <td className="text-gray-500">{item.term}</td>

                    {/* Session */}
                    <td className="text-gray-500">{item.session}</td>

                    {/* Total */}
                    <td className="text-gray-600">{item.totalScore}</td>

                    {/* Average */}
                    <td className="text-gray-600">{item.average}</td>

                    {/* Status */}
                    <td>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusColor(item.resultStatus)}`}>
                        {item.resultStatus}
                      </span>
                    </td>

                    {/* Grade */}
                    <td>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${gradeColor(overallGrade)}`}>
                        {overallGrade}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="relative">
                      <button onClick={() => toggleMenu(item._id)}>
                        <MoreHorizontal className="text-gray-400 cursor-pointer hover:text-[#A033A0]" />
                      </button>

                      {openMenuId === item._id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
                          <button
                            onClick={() => navigate(`/admin/results/view/${item.student._id}`)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/admin/results/edit/${item._id}`)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Print
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <p>
          Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="disabled:opacity-40"
          >
            {"<"}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-[#A033A0] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="disabled:opacity-40"
          >
            {">"}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ResultTable;