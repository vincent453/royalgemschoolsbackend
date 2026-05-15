import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import { FaUser, FaCamera } from "react-icons/fa";

const classes = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
const genders = ["Male", "Female"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find student from mock data
const existing = {};
  const [photo, setPhoto]     = useState(existing?.img || null)
  const [preview, setPreview] = useState(existing?.img || null)
  const [form, setForm]       = useState({
    firstName:   existing?.name?.split(" ")[0] || "",
    lastName:    existing?.name?.split(" ")[1] || "",
    email:       existing?.email  || "",
    phone:       existing?.phone  || "",
    dob:         existing?.dob    || "",
    gender:      existing?.gender || "",
    bloodGroup:  existing?.bloodGroup || "",
    address:     existing?.address || "",
    city:        existing?.city   || "",
    grade:       existing?.grade  || "",
    studentId:   existing?.studentId || "",
    parentName:  existing?.parent || "",
    parentPhone: existing?.parentPhone || "",
    parentEmail: existing?.parentEmail || "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const token = localStorage.getItem("token");

    // ✅ Create FormData
    const formData = new FormData();

    // ✅ Append all fields
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("dateOfBirth", form.dob);
    formData.append("gender", form.gender);
    formData.append("address", form.address);

    formData.append("classLevel", form.grade);
    formData.append("regNumber", form.studentId);

    formData.append("parentFirstName", form.parentName);
    formData.append("parentPhone", form.parentPhone);
    formData.append("parentEmail", form.parentEmail);

    // ✅ Append photo if selected
    if (photo instanceof File) {
      formData.append("profilePhoto", photo);
    }

    // ✅ API request
    const response = await fetch(
      `http://localhost:5000/api/students/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    console.log(data);

    navigate("/admin/students");

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const inputClass = `w-full border border-gray-200 rounded-lg px-4 py-2.5
                      font-dm-sans text-gray-700 text-sm placeholder-gray-300
                      focus:outline-none focus:border-[#A033A0] bg-white
                      transition-colors duration-300`

  const labelClass = `font-dm-sans text-[#A033A0] text-sm font-semibold mb-1 block`

  if (!existing) return (
    <div className="flex h-screen items-center justify-center">
      <p className="font-dm-sans text-gray-400">Student not found.</p>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#E6EBEE] overflow-hidden">
      <div className="fixed top-1 left-0 h-screen w-64 z-40">
  <Slidebar />
</div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="sticky top-0  z-50 w-full">
          <Topbar />
        </div>

        <main className="flex-1 overflow-scroll ml-64 mt-16">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-5xl mx-auto">

            {/* ── Page Title ── */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-jost font-bold text-gray-800 text-2xl">Edit Student</h1>
                <p className="font-dm-sans text-gray-400 text-sm mt-0.5">
                  Update information for {existing.name}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full font-dm-sans font-semibold
                               ${form.grade?.startsWith('JSS')
                                 ? 'bg-blue-100 text-blue-600'
                                 : 'bg-purple-100 text-[#A033A0]'}`}>
                {form.grade || "No Class"}
              </span>
            </div>

            {/* ── Section 1: Personal Details ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                Personal Details
              </h2>

              <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Photo upload */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="relative w-28 h-28 rounded-full bg-gray-100 border-2 border-[#A033A0]/20 overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaUser className="text-gray-300 text-4xl" />
                      </div>
                    )}
                    {/* Camera overlay */}
                    <label
                      htmlFor="photo"
                      className="absolute inset-0 bg-black/40 flex items-center justify-center
                                 opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                    >
                      <FaCamera className="text-white text-xl" />
                    </label>
                  </div>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <label
                      htmlFor="photo"
                      className="font-dm-sans text-xs font-semibold px-4 py-1.5 rounded-full
                                 bg-[#A033A0] text-white cursor-pointer hover:bg-[#525fe1]
                                 transition-colors duration-300"
                    >
                      Change
                    </label>
                    {preview && (
                      <button
                        type="button"
                        onClick={() => { setPhoto(null); setPreview(null) }}
                        className="font-dm-sans text-xs font-semibold px-4 py-1.5 rounded-full
                                   border border-red-300 text-red-400 hover:bg-red-50
                                   transition-colors duration-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Fields */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange}
                      placeholder="First name" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange}
                      placeholder="Last name" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth *</label>
                    <input type="date" name="dob" value={form.dob} onChange={handleChange}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Gender *</label>
                    <select name="gender" value={form.gender} onChange={handleChange}
                      className={inputClass} required>
                      <option value="">Select Gender</option>
                      {genders.map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Blood Group</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                      className={inputClass}>
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+234 800 000 0000" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="student@email.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input name="city" value={form.city} onChange={handleChange}
                      placeholder="City" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Address</label>
                    <textarea name="address" value={form.address} onChange={handleChange}
                      placeholder="Enter full address..." rows={3}
                      className={`${inputClass} resize-none`} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2: Academic Details ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                Academic Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Student ID</label>
                  <input name="studentId" value={form.studentId} onChange={handleChange}
                    placeholder="e.g. RGS-001" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Class *</label>
                  <select name="grade" value={form.grade} onChange={handleChange}
                    className={inputClass} required>
                    <option value="">Select Class</option>
                    {classes.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section 3: Parent / Guardian ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                Parent / Guardian
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Parent / Guardian Name *</label>
                  <input name="parentName" value={form.parentName} onChange={handleChange}
                    placeholder="Full name" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Parent Phone *</label>
                  <input name="parentPhone" value={form.parentPhone} onChange={handleChange}
                    placeholder="+234 800 000 0000" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Parent Email</label>
                  <input type="email" name="parentEmail" value={form.parentEmail}
                    onChange={handleChange} placeholder="parent@email.com" className={inputClass} />
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-4 pb-6">
              <button
                type="button"
                onClick={() => navigate("/admin/students")}
                className="font-jost font-semibold px-8 py-2.5 rounded-full border
                           border-gray-300 text-gray-600 hover:border-[#A033A0]
                           hover:text-[#A033A0] transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="font-jost font-semibold px-8 py-2.5 rounded-full
                           bg-[#A033A0] hover:bg-[#525fe1] text-white
                           transition-colors duration-500 disabled:opacity-50
                           disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  )
}

export default EditStudent