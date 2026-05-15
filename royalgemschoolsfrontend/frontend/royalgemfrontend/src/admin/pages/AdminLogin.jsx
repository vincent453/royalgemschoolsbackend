import { useState } from 'react'
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/img/logo.png'
import loginbanner from '../../assets/img/students.jpeg'
import { loginAdmin } from '../services/authService'
import { useEffect } from 'react'

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(""); // clear previous error

  try {
    const data = await loginAdmin(form);

    if (data.success) {
      localStorage.setItem("token", data.token);
      navigate("/admin/dashboard");
    } else {
      setError(data.message || "Login failed");
    }

  } catch {
    setError("Server error. Please try again.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    navigate("/admin/dashboard");
  }
}, [navigate]);

  const inputClass = `w-full bg-gray-100 border border-transparent focus:border-[#A033A0]
                      focus:outline-none focus:bg-white pl-11 pr-4 py-3.5
                      font-dm-sans text-gray-600 text-sm placeholder-gray-400
                      transition-all duration-300`

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full h-screen bg-white shadow-xl overflow-hidden flex">

        {/* Left — Form */}
        <div className="w-full lg:w-[45%] px-10 md:px-14 flex flex-col justify-center gap-8">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Royal Gem Logo" className="h-[9rem] object-contain" />
            <div>
              <h1 className="font-jost font-bold text-gray-900 text-lg leading-tight">
                Royal Gem
              </h1>
              <p className="font-dm-sans text-gray-400 text-xs tracking-widest uppercase">
                School Management System
              </p>
            </div>
          </div>

          {/* Heading */}
          <h2 className="font-jost font-bold text-gray-800 text-2xl">
            Login to your account
          </h2>
          {error && (
  <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-md">
    {error}
  </div>
)}
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400
                           hover:text-[#A033A0] transition-colors duration-300"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Forgot password */}
            <a
              href="#"
              className="font-dm-sans text-sm text-gray-400 hover:text-[#A033A0]
                         transition-colors duration-300 w-fit"
            >
              Forgot password?
            </a>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-fit bg-[#1a1a4b] hover:bg-[#A033A0] text-white font-jost
                         font-semibold px-10 py-3.5 rounded-lg transition-colors duration-300
                         mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

          </form>
        </div>

        {/* Right — Illustration */}
        <div className="hidden lg:flex w-[55%] bg-gradient-to-br from-[#f0f1ff] via-[#fce4ff] to-[#e8f4ff]
                        items-center justify-center relative overflow-hidden">

          {/* Background blobs */}
          <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-[#A033A0]/10 blur-3xl" />
          <div className="absolute bottom-[-40px] left-[-40px] w-52 h-52 rounded-full bg-[#525fe1]/10 blur-3xl" />
          <div className="absolute top-[40%] left-[5%] w-32 h-32 rounded-full bg-[#FFB400]/10 blur-2xl" />

          {/* Sparkles */}
          {[
            { top: '12%', left: '18%',  color: '#FFB400', size: 'text-xl' },
            { top: '22%', right: '12%', color: '#ff4d6d', size: 'text-sm' },
            { top: '58%', right: '8%',  color: '#A033A0', size: 'text-lg' },
            { top: '72%', left: '12%',  color: '#525fe1', size: 'text-sm' },
            { top: '38%', left: '6%',   color: '#00b4d8', size: 'text-xl' },
            { top: '80%', right: '20%', color: '#FFB400', size: 'text-sm' },
          ].map(({ top, left, right, color, size }, i) => (
            <span
              key={i}
              className={`absolute ${size} animate-pulse`}
              style={{ top, left, right, color, animationDelay: `${i * 0.4}s` }}
            >
              ✦
            </span>
          ))}

          {/* Illustration */}
          <div className="relative z-10 w-[78%]">
            <div
              className="absolute inset-[-18px] rounded-[60%_40%_30%_70%/60%_30%_70%_40%]
                         border-4 border-dashed border-[#A033A0]/30 animate-spin"
              style={{ animationDuration: '20s' }}
            />
            <div
              className="absolute inset-[-6px] rounded-[40%_60%_70%_30%/40%_50%_60%_50%]
                         border-2 border-dotted border-[#525fe1]/40 animate-spin"
              style={{ animationDuration: '15s', animationDirection: 'reverse' }}
            />
            <img
              src={loginbanner}
              alt="Students studying"
              className="w-full object-cover relative z-10"
              style={{
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                clipPath: 'ellipse(48% 46% at 50% 50%)',
                filter: 'drop-shadow(0 20px 40px rgba(160, 51, 160, 0.2))',
                aspectRatio: '1 / 1',
              }}
            />
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminLogin