import { useState } from "react";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import {
  FaLock, FaUserShield, FaBell, FaPalette,
  FaSchool, FaEye, FaEyeSlash, FaCamera, FaUser
} from "react-icons/fa";
import { Navigate } from "react-router-dom";

const tabs = [
  { id: "school",    label: "School Info",    icon: <FaSchool />    },
  { id: "account",   label: "Account",        icon: <FaUserShield /> },
  { id: "password",  label: "Change Password",icon: <FaLock />      },
  { id: "notif",     label: "Notifications",  icon: <FaBell />      },
  { id: "appearance",label: "Appearance",     icon: <FaPalette />   },
]

const Settings = () => {
  const [activeTab, setActiveTab]     = useState("school")
  const [loading, setLoading]         = useState(false)
  const [preview, setPreview]         = useState(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [successMsg, setSuccessMsg]   = useState("")

  // School Info
  const [school, setSchool] = useState({
    name:    "Royal Gem Schools",
    tagline: "Nurturing to Flourish",
    email:   "info@royalgemschools.com",
    phone:   "+234 800 000 0000",
    address: "Ikorodu, Lagos State",
    address2:"Abuja, FCT, Nigeria",
    website: "www.royalgemschools.com",
    session: "2024/2025",
  })

  // Account
  const [account, setAccount] = useState({
    adminName:  "Super Admin",
    adminEmail: "admin@royalgemschools.com",
    role:       "Super Administrator",
  })

  // Password
  const [passwords, setPasswords] = useState({
    current: "", newPass: "", confirm: ""
  })

  // Notifications
  const [notifs, setNotifs] = useState({
    resultUploaded:  true,
    newStudent:      true,
    newTeacher:      false,
    systemAlert:     true,
    emailNotif:      false,
  })

  // Appearance
  const [appearance, setAppearance] = useState({
    theme:    "light",
    accent:   "#A033A0",
    fontSize: "medium",
  })

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(""), 3000)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000)) // simulate API
    setLoading(false)
    showSuccess("Changes saved successfully!")
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (passwords.newPass !== passwords.confirm) {
      alert("New passwords do not match.")
      return
    }
    if (passwords.newPass.length < 8) {
      alert("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setPasswords({ current: "", newPass: "", confirm: "" })
    showSuccess("Password updated successfully!")
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  const inputClass = `w-full border border-gray-200 rounded-lg px-4 py-2.5
                      font-dm-sans text-gray-700 text-sm placeholder-gray-300
                      focus:outline-none focus:border-[#A033A0] bg-white
                      transition-colors duration-300`

  const labelClass = `font-dm-sans text-[#A033A0] text-sm font-semibold mb-1 block`



const handleLogout = () => {
  if (window.confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("token");
    window.location.href = "/admin/portal";
  }
};
  const PasswordInput = ({ label, field, show, toggle }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
        <input
          type={show ? "text" : "password"}
          value={passwords[field]}
          onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
          placeholder="••••••••"
          className={`${inputClass} pl-10 pr-10`}
          required
        />
        <button type="button" onClick={toggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400
                     hover:text-[#A033A0] transition-colors duration-300">
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  )

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300
                  ${checked ? 'bg-[#A033A0]' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                        transition-transform duration-300
                        ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">

      {/* Topbar — full width across the top */}
      <div className="sticky top-0 z-50 w-full">
        <Topbar />
      </div>

      {/* Below topbar: sidebar + content side by side */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="-mt-16">
        <Slidebar />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">

            {/* Header */}
            <div>
              <h1 className="font-jost font-bold text-gray-800 text-2xl">Settings</h1>
              <p className="font-dm-sans text-gray-400 text-sm mt-0.5">
                Manage your school system preferences
              </p>
            </div>

            {/* Success toast */}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700
                              font-dm-sans text-sm px-5 py-3 rounded-xl">
                ✓ {successMsg}
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">

              {/* Sidebar tabs */}
              <div className="w-full lg:w-56 shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-col gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                                  font-dm-sans font-semibold text-left transition-all duration-300
                                  ${activeTab === tab.id
                                    ? 'bg-[#A033A0] text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-[#A033A0]/10 hover:text-[#A033A0]'}`}
                    >
                      <span className="text-base">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                  <button
                  onClick={handleLogout}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                              font-dm-sans font-semibold text-left transition-all duration-300
                              text-gray-500 hover:bg-[#A033A0]/10 hover:text-[#A033A0]`}
                >
                  <span className="text-base"><FaUser /></span>
                  Log Out
                </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">

                {/* ── School Info ── */}
                {activeTab === "school" && (
                  <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
                    <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                      School Information
                    </h2>

                    {/* Logo */}
                    <div className="flex items-center gap-5">
                      <div className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-[#A033A0]/20 overflow-hidden shrink-0">
                        {preview
                          ? <img src={preview} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <FaSchool className="text-gray-300 text-3xl" />
                            </div>
                        }
                        <label htmlFor="logo"
                          className="absolute inset-0 bg-black/40 flex items-center justify-center
                                     opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                          <FaCamera className="text-white" />
                        </label>
                      </div>
                      <input id="logo" type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                      <div>
                        <label htmlFor="logo"
                          className="font-dm-sans text-xs font-semibold px-4 py-2 rounded-full
                                     bg-[#A033A0] text-white cursor-pointer hover:bg-[#525fe1]
                                     transition-colors duration-300">
                          Upload Logo
                        </label>
                        <p className="font-dm-sans text-xs text-gray-400 mt-2">PNG, JPG up to 2MB</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>School Name</label>
                        <input value={school.name}
                          onChange={(e) => setSchool({ ...school, name: e.target.value })}
                          className={inputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Tagline / Motto</label>
                        <input value={school.tagline}
                          onChange={(e) => setSchool({ ...school, tagline: e.target.value })}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Email</label>
                        <input type="email" value={school.email}
                          onChange={(e) => setSchool({ ...school, email: e.target.value })}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Phone</label>
                        <input value={school.phone}
                          onChange={(e) => setSchool({ ...school, phone: e.target.value })}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Address (Lagos)</label>
                        <input value={school.address}
                          onChange={(e) => setSchool({ ...school, address: e.target.value })}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Address (Abuja)</label>
                        <input value={school.address2}
                          onChange={(e) => setSchool({ ...school, address2: e.target.value })}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Website</label>
                        <input value={school.website}
                          onChange={(e) => setSchool({ ...school, website: e.target.value })}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Current Session</label>
                        <input value={school.session}
                          onChange={(e) => setSchool({ ...school, session: e.target.value })}
                          placeholder="e.g. 2024/2025" className={inputClass} />
                      </div>
                    </div>

                    <SaveButton loading={loading} />
                  </form>
                )}

                {/* ── Account ── */}
                {activeTab === "account" && (
                  <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
                    <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                      Account Details
                    </h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-5">
                      <div className="relative w-20 h-20 rounded-full bg-[#A033A0]/10 border-2 border-[#A033A0]/20 overflow-hidden shrink-0 flex items-center justify-center">
                        <FaUser className="text-[#A033A0] text-3xl" />
                      </div>
                      <div>
                        <p className="font-jost font-bold text-gray-800">{account.adminName}</p>
                        <p className="font-dm-sans text-gray-400 text-sm">{account.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Admin Name</label>
                        <input value={account.adminName}
                          onChange={(e) => setAccount({ ...account, adminName: e.target.value })}
                          className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Admin Email</label>
                        <input type="email" value={account.adminEmail}
                          onChange={(e) => setAccount({ ...account, adminEmail: e.target.value })}
                          className={inputClass} required />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Role</label>
                        <input value={account.role} disabled
                          className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
                        <p className="font-dm-sans text-xs text-gray-400 mt-1">
                          Role can only be changed by the system owner.
                        </p>
                      </div>
                    </div>

                    <SaveButton loading={loading} />
                  </form>
                )}

                {/* ── Change Password ── */}
                {activeTab === "password" && (
                  <form onSubmit={handlePasswordSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
                    <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                      Change Password
                    </h2>

                    {/* Tips */}
                    <div className="bg-[#f0f1ff] rounded-xl p-4 flex flex-col gap-1">
                      <p className="font-dm-sans text-sm font-semibold text-[#525fe1]">Password requirements:</p>
                      {[
                        "At least 8 characters long",
                        "Contains uppercase and lowercase letters",
                        "Contains at least one number",
                        "Contains at least one special character",
                      ].map((tip, i) => (
                        <p key={i} className="font-dm-sans text-xs text-gray-500">• {tip}</p>
                      ))}
                    </div>

                    <div className="flex flex-col gap-4 max-w-md">
                      <PasswordInput
                        label="Current Password"
                        field="current"
                        show={showCurrent}
                        toggle={() => setShowCurrent(!showCurrent)}
                      />
                      <PasswordInput
                        label="New Password"
                        field="newPass"
                        show={showNew}
                        toggle={() => setShowNew(!showNew)}
                      />
                      <PasswordInput
                        label="Confirm New Password"
                        field="confirm"
                        show={showConfirm}
                        toggle={() => setShowConfirm(!showConfirm)}
                      />
                    </div>

                    {/* Strength indicator */}
                    {passwords.newPass && (
                      <div className="max-w-md flex flex-col gap-1">
                        <p className="font-dm-sans text-xs text-gray-400">Password strength</p>
                        <div className="flex gap-1">
                          {[1,2,3,4].map((n) => (
                            <div key={n}
                              className={`h-1.5 flex-1 rounded-full transition-colors duration-300
                                          ${passwords.newPass.length >= n * 3
                                            ? n <= 1 ? 'bg-red-400'
                                            : n <= 2 ? 'bg-orange-400'
                                            : n <= 3 ? 'bg-yellow-400'
                                            : 'bg-green-400'
                                            : 'bg-gray-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <SaveButton loading={loading} label="Update Password" />
                  </form>
                )}

                {/* ── Notifications ── */}
                {activeTab === "notif" && (
                  <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
                    <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                      Notification Preferences
                    </h2>

                    <div className="flex flex-col gap-4">
                      {[
                        { key: "resultUploaded", label: "Result Uploaded",    desc: "Get notified when a result is uploaded"       },
                        { key: "newStudent",     label: "New Student Added",  desc: "Get notified when a new student is registered" },
                        { key: "newTeacher",     label: "New Teacher Added",  desc: "Get notified when a new teacher is added"      },
                        { key: "systemAlert",    label: "System Alerts",      desc: "Critical system and security alerts"           },
                        { key: "emailNotif",     label: "Email Notifications",desc: "Receive notifications via email"               },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-dm-sans font-semibold text-gray-700 text-sm">{label}</p>
                            <p className="font-dm-sans text-gray-400 text-xs mt-0.5">{desc}</p>
                          </div>
                          <Toggle
                            checked={notifs[key]}
                            onChange={(val) => setNotifs({ ...notifs, [key]: val })}
                          />
                        </div>
                      ))}
                    </div>

                    <SaveButton loading={loading} />
                  </form>
                )}

                {/* ── Appearance ── */}
                {activeTab === "appearance" && (
                  <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
                    <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                      Appearance
                    </h2>

                    {/* Theme */}
                    <div className="flex flex-col gap-3">
                      <label className={labelClass}>Theme</label>
                      <div className="flex gap-3">
                        {["light", "dark"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setAppearance({ ...appearance, theme: t })}
                            className={`flex-1 py-3 rounded-xl border-2 font-dm-sans font-semibold
                                        text-sm capitalize transition-all duration-300
                                        ${appearance.theme === t
                                          ? 'border-[#A033A0] text-[#A033A0] bg-[#A033A0]/5'
                                          : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                          >
                            {t === "light" ? "☀️" : "🌙"} {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent color */}
                    <div className="flex flex-col gap-3">
                      <label className={labelClass}>Accent Color</label>
                      <div className="flex gap-3 flex-wrap">
                        {["#A033A0", "#525fe1", "#e11d48", "#0ea5e9", "#16a34a", "#f59e0b"].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setAppearance({ ...appearance, accent: color })}
                            className={`w-9 h-9 rounded-full border-4 transition-all duration-300
                                        ${appearance.accent === color ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Font size */}
                    <div className="flex flex-col gap-3">
                      <label className={labelClass}>Font Size</label>
                      <div className="flex gap-3">
                        {["small", "medium", "large"].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setAppearance({ ...appearance, fontSize: size })}
                            className={`flex-1 py-3 rounded-xl border-2 font-dm-sans font-semibold
                                        text-sm capitalize transition-all duration-300
                                        ${appearance.fontSize === size
                                          ? 'border-[#A033A0] text-[#A033A0] bg-[#A033A0]/5'
                                          : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <SaveButton loading={loading} />
                  </form>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Reusable save button
const SaveButton = ({ loading, label = "Save Changes" }) => (
  <div className="flex justify-end pt-2 border-t border-gray-100">
    <button
      type="submit"
      disabled={loading}
      className="font-jost font-semibold px-8 py-2.5 rounded-full bg-[#A033A0]
                 hover:bg-[#525fe1] text-white transition-colors duration-500
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Saving..." : label}
    </button>
  </div>
)

export default Settings