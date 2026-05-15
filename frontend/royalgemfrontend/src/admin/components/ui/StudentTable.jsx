import { useState, useEffect } from "react";
import { Phone, Mail, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const classSegments = [
  { label: "All",           value: "all"          },
  { label: "Nursery 1",     value: "Nursery 1"    },
  { label: "Nursery 2",     value: "Nursery 2"    },
  { label: "Kindergarten",  value: "Kindergarten" },
  { label: "JSS 1",         value: "JSS 1"        },
  { label: "JSS 2",         value: "JSS 2"        },
  { label: "JSS 3",         value: "JSS 3"        },
  { label: "SSS 1",         value: "SSS 1"        },
  { label: "SSS 2",         value: "SSS 2"        },
  { label: "SSS 3",         value: "SSS 3"        },
]

const itemsPerPage = 8

const StudentTable = () => {
  const navigate = useNavigate()

  // ── Data state ──
  const [students,  setStudents]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState("")

  // ── UI state ──
  const [activeClass,  setActiveClass]  = useState("all")
  const [currentPage,  setCurrentPage]  = useState(1)
  const [openMenuId,   setOpenMenuId]   = useState(null)

  // ── Fetch students from backend ──
  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem("token")
      const res   = await fetch("http://localhost:5000/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to fetch students")
      setStudents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStudents() }, [])

  // ── Delete handler ──
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    try {
      const token = localStorage.getItem("token")
      const res   = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setStudents(prev => prev.filter(s => s._id !== id))
      setOpenMenuId(null)
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  // ── Filter + paginate ──
  const filtered = activeClass === "all"
    ? students
    : students.filter(s => s.classLevel === activeClass)

  const totalItems  = filtered.length
  const totalPages  = Math.ceil(totalItems / itemsPerPage)
  const startIndex  = (currentPage - 1) * itemsPerPage
  const currentData = filtered.slice(startIndex, startIndex + itemsPerPage)

  const handleClassChange = (value) => {
    setActiveClass(value)
    setCurrentPage(1)
    setOpenMenuId(null)
  }

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id)

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
          {classSegments.map(s => (
            <div key={s.value} className="h-8 w-20 rounded-full bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col items-center gap-3 py-16">
        <p className="font-dm-sans text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchStudents}
          className="px-5 py-2 bg-[#A033A0] text-white text-sm rounded-full font-dm-sans font-semibold hover:bg-[#525fe1] transition-colors duration-300"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col gap-4">

      {/* ── Class Segment Tabs ── */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
        {classSegments.map(({ label, value }) => {
          const count = value === "all"
            ? students.length
            : students.filter(s => s.classLevel === value).length
          return (
            <button
              key={value}
              onClick={() => handleClassChange(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-dm-sans font-semibold
                          transition-all duration-300
                          ${activeClass === value
                            ? "bg-[#A033A0] text-white shadow-sm"
                            : "bg-gray-100 text-gray-500 hover:bg-[#A033A0]/10 hover:text-[#A033A0]"}`}
            >
              {label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                                ${activeClass === value
                                  ? "bg-white/20 text-white"
                                  : "bg-gray-200 text-gray-500"}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <p className="font-jost font-bold text-gray-700 text-base">
          {activeClass === "all" ? "All Students" : `${activeClass} Students`}
        </p>
        <p className="font-dm-sans text-sm text-gray-400">
          {totalItems} {totalItems === 1 ? "student" : "students"} found
        </p>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="py-3"><input type="checkbox" /></th>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Reg No.</th>
              <th className="py-3 pr-4">Gender</th>
              <th className="py-3 pr-4">Parent Name</th>
              <th className="py-3 pr-4">Contact</th>
              <th className="py-3 pr-4">Class</th>
              <th className="py-3 pr-4">Session</th>
              <th className="py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {currentData.length > 0 ? (
              currentData.map((student) => (
                <tr
                  key={student._id}
                  className="border-b hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-4"><input type="checkbox" /></td>

                  {/* Name + photo */}
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      {student.profilePhoto ? (
                        <img
                          src={student.profilePhoto}
                          alt={student.firstName}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#A033A0]/10 flex items-center justify-center shrink-0">
                          <span className="text-[#A033A0] font-bold text-sm">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-gray-700 whitespace-nowrap">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                  </td>

                  {/* Reg number */}
                  <td className="pr-4 text-[#A033A0] font-medium whitespace-nowrap">
                    {student.regNumber}
                  </td>

                  {/* Gender */}
                  <td className="pr-4 text-gray-500 whitespace-nowrap">{student.gender}</td>

                  {/* Parent name */}
                  <td className="pr-4 text-gray-600 whitespace-nowrap">
                    {student.parentFirstName
                      ? `${student.parentFirstName} ${student.parentLastName ?? ""}`
                      : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Contact */}
                  <td className="pr-4">
                    <div className="flex gap-2">
                      {student.parentPhone && (
                        <a href={`tel:${student.parentPhone}`}>
                          <button className="p-2 bg-[#A033A0]/10 text-[#A033A0] rounded-full hover:bg-[#A033A0] hover:text-white transition-colors duration-300">
                            <Phone size={14} />
                          </button>
                        </a>
                      )}
                      {student.parentEmail && (
                        <a href={`mailto:${student.parentEmail}`}>
                          <button className="p-2 bg-[#A033A0]/10 text-[#A033A0] rounded-full hover:bg-[#A033A0] hover:text-white transition-colors duration-300">
                            <Mail size={14} />
                          </button>
                        </a>
                      )}
                      {!student.parentPhone && !student.parentEmail && (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </div>
                  </td>

                  {/* Class badge */}
                  <td className="pr-4">
                    <span className={`px-3 py-1 text-xs rounded-full font-dm-sans font-semibold
                                      ${student.classLevel?.startsWith("JSS")
                                        ? "bg-blue-100 text-blue-600"
                                        : student.classLevel?.startsWith("SSS")
                                          ? "bg-purple-100 text-[#A033A0]"
                                          : "bg-green-100 text-green-600"}`}>
                      {student.classLevel}
                    </span>
                  </td>

                  {/* Session */}
                  <td className="pr-4 text-gray-500 whitespace-nowrap">{student.session}</td>

                  {/* Action menu */}
                  <td className="relative">
                    <button onClick={() => toggleMenu(student._id)}>
                      <MoreHorizontal className="text-gray-400 cursor-pointer hover:text-[#A033A0]" />
                    </button>

                    {openMenuId === student._id && (
                      <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-lg shadow-lg z-50">
                        <button
                          onClick={() => { navigate(`/admin/students/edit/${student._id}`); setOpenMenuId(null) }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student._id, `${student.firstName} ${student.lastName}`)}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center font-dm-sans text-gray-400">
                  No students found{activeClass !== "all" ? ` in ${activeClass}` : ""}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer / Pagination ── */}
      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
        <p className="font-dm-sans">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500
                       hover:border-[#A033A0] hover:text-[#A033A0]
                       disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
          >‹</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-lg border transition-all duration-300
                          ${currentPage === page
                            ? "bg-[#A033A0] text-white border-[#A033A0]"
                            : "border-gray-200 text-gray-500 hover:border-[#A033A0] hover:text-[#A033A0]"}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 rounded-lg border border-gray-200 text-gray-500
                       hover:border-[#A033A0] hover:text-[#A033A0]
                       disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
          >›</button>
        </div>
      </div>

    </div>
  )
}

export default StudentTable