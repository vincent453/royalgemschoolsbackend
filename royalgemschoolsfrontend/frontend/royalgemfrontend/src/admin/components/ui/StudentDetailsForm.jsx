import { useState, useRef } from "react";

export default function StudentDetailsForm({
  title = "Student Details",
  form,
  setForm,
}) {
  const fileInputRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
      setForm({ ...form, profilePhoto: file });
    }
  };

  const handleRemove = () => {
    setPhoto(null);
    setForm({ ...form, profilePhoto: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="bg-white rounded-md shadow-sm p-6 w-full">
      {/* Title */}
      <h2 className="text-base font-bold text-gray-800 pb-4 border-b border-gray-100">
        {title}
      </h2>

      <div className="mt-6 flex gap-8">
        {/* ── Photo Upload ── */}
        <div className="flex flex-col items-start gap-3 w-36 flex-shrink-0">
          <label className="text-sm font-semibold text-[#A13EA1]">
            Photo<span className="text-red-500">*</span>
          </label>

          <div className="w-full h-[8rem] rounded-xl border border-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center">
            {photo ? (
              <img
                src={photo}
                alt="Student"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                viewBox="0 0 80 80"
                className="w-16 h-16 text-gray-400"
                fill="currentColor"
              >
                <circle cx="40" cy="30" r="14" />
                <ellipse cx="40" cy="62" rx="24" ry="14" />
              </svg>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-[#A13EA1] hover:bg-[#8a328a] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Choose File
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-400 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
            >
              Remove
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
        </div>

        {/* ── Form Fields (all inside one unified grid) ── */}
        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-5">
          {/* First Name */}
          <Field label="First Name" required>
            <Input
              name="firstName"
              placeholder="James"
              value={form.firstName}
              onChange={handleChange}
            />
          </Field>

          {/* Last Name */}
          <Field label="Last Name" required>
            <Input
              name="lastName"
              placeholder="Wally"
              value={form.lastName}
              onChange={handleChange}
            />
          </Field>

          {/* Date & Place of Birth */}
          <Field label="Date & Place of Birth" required>
            <div className="flex gap-2">
              <Input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                className="w-1/2"
                onChange={handleChange}
              />
              <Input
                name="placeOfBirth"
                placeholder="USA"
                value={form.placeOfBirth}
                className="w-1/2"
                onChange={handleChange}
              />
            </div>
          </Field>

          {/* Gender */}
          <Field label="Gender" required>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A13EA1] focus:border-transparent transition"
            >
              <option value="">Select a gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </Field>

          {/* Class Level */}
          <Field label="Class Level" required>
            <select
              name="classLevel"
              value={form.classLevel}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A13EA1] focus:border-transparent transition"
            >
              <option value="">Select Class Level</option>
              <option value="Jss 1">Jss 1</option>
              <option value="Jss 2">Jss 2</option>
              <option value="Jss 3">Jss 3</option>
              <option value="SSs 1">SSs 1</option>
              <option value="SSs 2">SSs 2</option>
              <option value="SSs 3">SSs 3</option>
            </select>
          </Field>

          {/* Session */}
          <Field label="Session" required>
            <Input
              name="session"
              value={form.session}
              placeholder="e.g., 2023/2024"
              onChange={handleChange}
            />
          </Field>

          {/* Reg Number */}
          <Field label="Reg. Number" required>
            <Input
              name="regNumber"
              value={form.regNumber}
              placeholder="e.g., STU/2024/001"
              onChange={handleChange}
            />
          </Field>

          {/* Address — spans both columns */}
          <Field label="Address" required className="col-span-2">
            <textarea
              name="address"
              placeholder="Enter full address..."
              value={form.address}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A13EA1] focus:border-transparent resize-none transition"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable sub-components ── */
function Field({ label, required, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-[#A13EA1]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A13EA1] focus:border-transparent transition ${className}`}
    />
  );
}