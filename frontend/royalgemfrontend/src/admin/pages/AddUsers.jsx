import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import { useState } from 'react'
import { FaEye, FaEyeSlash, FaRedo, FaCopy, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const roles = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Manage students, results, fees and school settings',
  },
  {
    value: 'teacher',
    label: 'Teacher',
    description: 'Upload results and view assigned class information',
  },
]

const classes = ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3']

const AddUser = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName:     '',
    lastName:      '',
    email:         '',
    phone:         '',
    role:          '',
    assignedClass: '',
    status:        'Active',
    username:      '',
    portalPin:     '',
    subjects: [],
  })

  const [showPin, setShowPin]         = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [errors, setErrors]           = useState({})
  const [loading, setLoading]         = useState(false)
  const [apiError, setApiError]       = useState('')

  const generateUsername = () => {
    if (form.firstName && form.lastName) {
      const uname = `${form.firstName.toLowerCase().trim()}.${form.lastName.toLowerCase().trim()}`
      update('username', uname)
    }
  }

  const generatePin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    update('portalPin', pin)
  }

  const handleCopy = (field, value) => {
    navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.firstName.trim())  e.firstName = 'First name is required'
    if (!form.lastName.trim())   e.lastName  = 'Last name is required'
    if (!form.email.trim())      e.email     = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.role)              e.role      = 'Please select a role'
    if (!form.username.trim())   e.username  = 'Username is required'
    else if (/\s/.test(form.username)) e.username = 'Username cannot contain spaces'
    if (!form.portalPin)         e.portalPin = 'Portal PIN is required'
    else if (!/^\d{4,8}$/.test(form.portalPin)) e.portalPin = 'PIN must be 4–8 digits'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // ✅ Combine firstName + lastName into name, use portalPin as password
      const payload = {
        name:        `${form.firstName.trim()} ${form.lastName.trim()}`,
        email:       form.email.trim(),
        phoneNumber: form.phone.trim(),
        role:        form.role,
        password:    form.portalPin, // PIN is used as the login password
        isActive:    form.status === 'Active',
         subjects: form.role === "teacher" ? form.subjects : [],
  assignedClass: form.role === "teacher" ? form.assignedClass : null,
      }

      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create user')

      navigate('/users')
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectChange = (value) => {
  setForm(prev => ({
    ...prev,
    subjects: value.split(",").map(s => s.trim())
  }))
}
  const inputClass = (field) =>
    `w-full border rounded-lg px-4 py-2.5 font-dm-sans text-gray-700 text-sm placeholder-gray-300
     focus:outline-none transition-colors duration-300
     ${errors[field]
       ? 'border-red-400 focus:border-red-400'
       : 'border-gray-200 focus:border-[#A033A0]'}`

  const labelClass = `font-dm-sans text-[#A033A0] text-sm font-semibold mb-1 block`
  const errorClass = `font-dm-sans text-xs text-red-400 mt-1`

  const selectedRole = roles.find(r => r.value === form.role)
  const showClassField = form.role === 'teacher'

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
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">

            {/* ── Section 1: Personal Information ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                Personal Information
              </h2>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col flex-1 min-w-[180px]">
                  <label className={labelClass}>First Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Chidinma"
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    className={inputClass('firstName')}
                  />
                  {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
                </div>

                <div className="flex flex-col flex-1 min-w-[180px]">
                  <label className={labelClass}>Last Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Okafor"
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    className={inputClass('lastName')}
                  />
                  {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col flex-1 min-w-[200px]">
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. chidinma@school.edu.ng"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={inputClass('email')}
                  />
                  {errors.email && <p className={errorClass}>{errors.email}</p>}
                </div>

                <div className="flex flex-col flex-1 min-w-[180px]">
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className={inputClass('phone')}
                  />
                </div>
              </div>
            </div>

                    {showClassField && (
          <div className="flex flex-col flex-1 min-w-[180px] max-w-xs mt-4">
            <label className={labelClass}>Subjects Taught</label>

            <input
              type="text"
              placeholder="e.g Math, English, Physics"
              value={form.subjects.join(", ")}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className={inputClass('subjects')}
            />

            <p className="text-xs text-gray-400 mt-1">
              Separate subjects with commas
            </p>
          </div>
        )}

            {/* ── Section 2: Role & Access ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                Role & Access
              </h2>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col flex-[2] min-w-[200px]">
                  <label className={labelClass}>Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => update('role', e.target.value)}
                    className={inputClass('role')}
                  >
                    <option value="">-- Select a Role --</option>
                    {roles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {errors.role && <p className={errorClass}>{errors.role}</p>}
                  {selectedRole && (
                    <p className="font-dm-sans text-xs text-gray-400 mt-2 bg-[#fdf8ff] border border-[#f0e0f0] rounded-lg px-3 py-2">
                      ℹ️ {selectedRole.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-[160px]">
                  <label className={labelClass}>Account Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => update('status', e.target.value)}
                    className={inputClass('status')}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Role cards */}
              <div>
                <label className={`${labelClass} mb-3`}>Or pick a role visually</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => update('role', r.value)}
                      className={`text-left p-4 rounded-xl border-2 transition-all duration-300
                        ${form.role === r.value
                          ? 'border-[#A033A0] bg-[#fdf8ff]'
                          : 'border-gray-100 bg-gray-50 hover:border-[#d9a0d9]'}`}
                    >
                      <p className={`font-jost font-bold text-sm mb-1
                        ${form.role === r.value ? 'text-[#A033A0]' : 'text-gray-700'}`}>
                        {r.label}
                      </p>
                      <p className="font-dm-sans text-xs text-gray-400 leading-relaxed">
                        {r.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned class — only for teachers */}
              {showClassField && (
                <div className="flex flex-col flex-1 min-w-[180px] max-w-xs">
                  <label className={labelClass}>Assigned Class</label>
                  <select
                    value={form.assignedClass}
                    onChange={(e) => update('assignedClass', e.target.value)}
                    className={inputClass('assignedClass')}
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* ── Section 3: Login Credentials ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                Login Credentials
              </h2>

              <p className="font-dm-sans text-xs text-gray-400 -mt-2">
                The portal PIN will be used as this user's login password. Share it securely.
              </p>

              <div className="flex flex-wrap gap-4">

                {/* Username — for display/reference only, not saved to this model */}
                <div className="flex flex-col flex-1 min-w-[200px]">
                  <label className={labelClass}>Username (reference only)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="e.g. chidinma.okafor"
                        value={form.username}
                        onChange={(e) => update('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                        className={`${inputClass('username')} pr-9`}
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy('username', form.username)}
                        disabled={!form.username}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300
                                   hover:text-[#A033A0] disabled:opacity-30 transition-colors duration-300"
                      >
                        {copiedField === 'username'
                          ? <FaCheckCircle className="text-green-500 text-xs" />
                          : <FaCopy className="text-xs" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={generateUsername}
                      disabled={!form.firstName || !form.lastName}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-200
                                 font-dm-sans text-xs font-semibold text-gray-500
                                 hover:border-[#A033A0] hover:text-[#A033A0]
                                 disabled:opacity-30 transition-all duration-300 whitespace-nowrap"
                    >
                      <FaRedo className="text-xs" /> Auto
                    </button>
                  </div>
                  {errors.username && <p className={errorClass}>{errors.username}</p>}
                  <p className="font-dm-sans text-xs text-gray-400 mt-1">
                    For your reference only — login is via email.
                  </p>
                </div>

                {/* Portal PIN = password */}
                <div className="flex flex-col flex-1 min-w-[200px]">
                  <label className={labelClass}>Portal PIN * (used as password)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPin ? 'text' : 'password'}
                        placeholder="4–8 digit PIN"
                        maxLength={8}
                        value={form.portalPin}
                        onChange={(e) => update('portalPin', e.target.value.replace(/\D/g, ''))}
                        className={`${inputClass('portalPin')} pr-16`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy('pin', form.portalPin)}
                          disabled={!form.portalPin}
                          className="text-gray-300 hover:text-[#A033A0] disabled:opacity-30 transition-colors duration-300"
                        >
                          {copiedField === 'pin'
                            ? <FaCheckCircle className="text-green-500 text-xs" />
                            : <FaCopy className="text-xs" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="text-gray-300 hover:text-[#A033A0] transition-colors duration-300"
                        >
                          {showPin ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={generatePin}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-200
                                 font-dm-sans text-xs font-semibold text-gray-500
                                 hover:border-[#A033A0] hover:text-[#A033A0]
                                 transition-all duration-300 whitespace-nowrap"
                    >
                      <FaRedo className="text-xs" /> Generate
                    </button>
                  </div>
                  {errors.portalPin && <p className={errorClass}>{errors.portalPin}</p>}
                  <p className="font-dm-sans text-xs text-gray-400 mt-1">
                    This PIN is the user's login password. Keep it confidential.
                  </p>
                </div>

              </div>

              {/* Credentials preview */}
              {(form.username || form.portalPin) && (
                <div className="bg-[#fdf8ff] border border-[#f0e0f0] rounded-xl px-5 py-4 flex flex-col gap-2">
                  <p className="font-dm-sans text-xs font-semibold text-[#A033A0] uppercase tracking-wide mb-1">
                    Credentials Preview
                  </p>
                  <div className="flex flex-wrap gap-6">
                    {form.email && (
                      <div>
                        <p className="font-dm-sans text-xs text-gray-400">Login Email</p>
                        <p className="font-jost font-bold text-gray-700 text-sm">{form.email}</p>
                      </div>
                    )}
                    {form.portalPin && (
                      <div>
                        <p className="font-dm-sans text-xs text-gray-400">Portal PIN (Password)</p>
                        <p className="font-jost font-bold text-[#A033A0] text-sm tracking-widest">
                          {showPin ? form.portalPin : '•'.repeat(form.portalPin.length)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── API Error ── */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl text-sm font-medium font-dm-sans">
                {apiError}
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-4 pb-6">
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="font-jost font-semibold px-8 py-2.5 rounded-full border
                           border-gray-300 text-gray-600 hover:border-[#A033A0]
                           hover:text-[#A033A0] transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`font-jost font-semibold px-8 py-2.5 rounded-full text-white
                            transition-colors duration-500
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#A033A0] hover:bg-[#525fe1]'}`}
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  )
}

export default AddUser