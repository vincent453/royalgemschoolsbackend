import { useState } from "react";

export default function ParentsDetailsForm({ onSave, onSaveAsDraft }) {
  const [form, setForm] = useState({
    university: "",
    degree: "",
    start: "2024-01-01",
    end: "2026-02-01",
    payments: { cash: false, online: false },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };



  return (
    <div className="bg-white rounded-md shadow-sm p-6 w-full">
      {/* Title */}
      <h2 className="text-base font-bold text-gray-800 pb-4 border-b border-gray-100">
        Education 
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
        {/* University */}
        <Field label="University" required>
          <Input
            name="university"
            placeholder="Mana"
            value={form.university}
            onChange={handleChange}
          />
        </Field>

        {/* Degree */}
        <Field label="Degree" required>
          <Input
            name="degree"
            placeholder="Bachelor of Science"
            value={form.degree}
            onChange={handleChange}
          />
        </Field>

        {/* Email */}
         <Field label="Start & End Date" required>
              <div className="flex gap-2">
                <Input
                  name="start"
                  type="date"
                  placeholder="05/01/2024"
                  value={form.start}

                  onChange={handleChange}
                  className="w-1/2"
                />
                 <Input
                  name="end"
                  type="date"
                  placeholder="05/01/2026"
                  value={form.end}
                  onChange={handleChange}
                  className="w-1/2"
                />
              </div>
            </Field>
        </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={onSaveAsDraft}
          className="px-5 py-2 text-sm font-semibold text-[#A13EA1] border border-[#A13EA1] hover:bg-[#A13EA1]/10 rounded-xl transition-colors"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-6 py-2 text-sm font-semibold text-white bg-[#A13EA1] hover:bg-[#8a328a] rounded-xl transition-colors shadow-sm"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#A13EA1]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A13EA1]  focus:border-transparent transition"
    />
  );
}