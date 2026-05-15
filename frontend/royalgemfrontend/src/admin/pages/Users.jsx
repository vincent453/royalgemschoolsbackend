import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaTrash, FaEdit, FaEllipsisV, FaShieldAlt, FaUser, FaChalkboardTeacher, FaUserTie } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const roleConfig = {
  'admin':   { label: 'Admin',   color: 'bg-blue-100 text-blue-700',   icon: <FaUserTie className="text-xs" /> },
  'teacher': { label: 'Teacher', color: 'bg-green-100 text-green-700', icon: <FaChalkboardTeacher className="text-xs" /> },
  'student': { label: 'Student', color: 'bg-purple-100 text-purple-700', icon: <FaUser className="text-xs" /> },
  'parent':  { label: 'Parent',  color: 'bg-orange-100 text-orange-700', icon: <FaUser className="text-xs" /> },
}

const avatarColors = [
  'bg-purple-200 text-purple-800',
  'bg-blue-200 text-blue-800',
  'bg-green-200 text-green-800',
  'bg-orange-200 text-orange-800',
  'bg-pink-200 text-pink-800',
  'bg-teal-200 text-teal-800',
  'bg-indigo-200 text-indigo-800',
  'bg-rose-200 text-rose-800',
]

const roleFilters   = ['All Roles', 'admin', 'teacher', 'student', 'parent']
const statusFilters = ['All Status', 'Active', 'Inactive']

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const Users = () => {
  const navigate = useNavigate()
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [roleFilter, setRoleFilter]     = useState('All Roles')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [openMenu, setOpenMenu]         = useState(null)

  // ── Fetch users ──
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setUsers(data.users || data) // handles both { users: [] } and []
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  // ── Delete user ──
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setUsers(prev => prev.filter(u => u._id !== id))
      setOpenMenu(null)
    } catch (err) {
      alert(err.message)
    }
  }

  // ── Filter ──
  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter   === 'All Roles'  || u.role === roleFilter
    const matchStatus = statusFilter === 'All Status' ||
                        (statusFilter === 'Active' ? u.isActive : !u.isActive)
    return matchSearch && matchRole && matchStatus
  })

  const inputClass = `border border-gray-200 rounded-lg px-4 py-2.5
                      font-dm-sans text-gray-700 text-sm placeholder-gray-300
                      focus:outline-none focus:border-[#A033A0] transition-colors duration-300`
  const labelClass = `font-dm-sans text-[#A033A0] text-sm font-semibold mb-1 block`

  const stats = [
    { label: 'Total Users', value: users.length,                              color: 'text-gray-800'    },
    { label: 'Active',      value: users.filter(u => u.isActive).length,      color: 'text-emerald-600' },
    { label: 'Inactive',    value: users.filter(u => !u.isActive).length,     color: 'text-red-500'     },
    { label: 'Teachers',    value: users.filter(u => u.role === 'teacher').length, color: 'text-blue-500' },
  ]

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">

      <div className="sticky top-0 z-50 w-full">
        <Topbar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar />
        </div>

        <main className="w-full overflow-y-auto">
          <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-jost font-bold text-gray-800 text-2xl">Users</h1>
                <p className="font-dm-sans text-sm text-gray-400 mt-0.5">
                  Manage all system users and their access roles
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/addUsers')}
                className="flex items-center gap-2 font-jost font-semibold px-6 py-2.5 rounded-full
                           bg-[#A033A0] hover:bg-[#525fe1] text-white text-sm
                           transition-colors duration-500 shadow-sm"
              >
                <FaPlus className="text-xs" />
                Add User
              </button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
                  <p className={`font-jost font-bold text-3xl ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* ── Filters & Search ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1 flex-[2] min-w-[200px]">
                <label className={labelClass}>Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${inputClass} pl-9 w-full`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                <label className={labelClass}>Role</label>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={`${inputClass} w-full`}>
                  {roleFilters.map(r => <option key={r} value={r}>{r === 'All Roles' ? r : roleConfig[r]?.label || r}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                <label className={labelClass}>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} w-full`}>
                  {statusFilters.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* ── Users Table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              <div className="hidden md:grid grid-cols-[2fr_2fr_1.2fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
                {['Name', 'Email', 'Role', 'Status', 'Joined', ''].map((h, i) => (
                  <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">
                    {h}
                  </span>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-16 text-gray-300">
                  <p className="font-dm-sans text-sm">Loading users...</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center justify-center py-16">
                  <p className="font-dm-sans text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                  <FaUser className="text-4xl mb-3" />
                  <p className="font-dm-sans text-sm">No users found</p>
                </div>
              )}

              {/* Rows */}
              {!loading && !error && filtered.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {filtered.map((u, i) => (
                    <div
                      key={u._id}
                      className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1.2fr_1fr_1fr_auto] gap-4
                                 px-6 py-4 items-center hover:bg-[#fdf8ff] transition-colors duration-200"
                    >
                      {/* Name + Avatar */}
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center
                                         font-jost font-bold text-xs flex-shrink-0
                                         ${avatarColors[i % avatarColors.length]}`}>
                          {getInitials(u.name)}
                        </div>
                        <span className="font-dm-sans text-sm font-semibold text-gray-700 truncate">
                          {u.name}
                        </span>
                      </div>

                      {/* Email */}
                      <span className="font-dm-sans text-sm text-gray-400 truncate">{u.email}</span>

                      {/* Role badge */}
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-dm-sans font-semibold
                                          ${roleConfig[u.role]?.color || 'bg-gray-100 text-gray-600'}`}>
                          {roleConfig[u.role]?.icon}
                          {roleConfig[u.role]?.label || u.role}
                        </span>
                      </div>

                      {/* Status badge */}
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-dm-sans font-semibold
                                          ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5
                            ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Joined */}
                      <span className="font-dm-sans text-xs text-gray-400">
                        {formatDate(u.createdAt)}
                      </span>

                      {/* Actions */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === u._id ? null : u._id)}
                          className="text-gray-300 hover:text-[#A033A0] transition-colors duration-300 p-1"
                        >
                          <FaEllipsisV className="text-sm" />
                        </button>

                        {openMenu === u._id && (
                          <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100
                                          py-1 z-10 min-w-[140px]">
                            <button
                              onClick={() => { navigate(`/admin/users/edit/${u._id}`); setOpenMenu(null) }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-dm-sans
                                         text-gray-600 hover:bg-[#fdf8ff] hover:text-[#A033A0] transition-colors"
                            >
                              <FaEdit className="text-xs" /> Edit User
                            </button>
                            <button
                              onClick={() => handleDelete(u._id, u.name)}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-dm-sans
                                         text-red-400 hover:bg-red-50 transition-colors"
                            >
                              <FaTrash className="text-xs" /> Delete
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-50 bg-gray-50">
                <p className="font-dm-sans text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{' '}
                  <span className="font-semibold text-gray-600">{users.length}</span> users
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default Users