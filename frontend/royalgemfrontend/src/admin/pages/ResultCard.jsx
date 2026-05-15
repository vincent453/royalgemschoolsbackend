import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo.png";
import signature from "../../assets/img/signature.jpeg";

const Cell = ({ children, bold, center, colSpan, rowSpan, className = "" }) => (
  <td
    colSpan={colSpan}
    rowSpan={rowSpan}
    className={[
      "border border-black px-1 py-0.5 text-[11px] leading-tight",
      bold ? "font-bold" : "font-normal",
      center ? "text-center" : "",
      className,
    ].join(" ")}
  >
    {children}
  </td>
);

const Th = ({ children, rowSpan, colSpan, className = "" }) => (
  <th
    rowSpan={rowSpan}
    colSpan={colSpan}
    className={[
      "border border-black px-1 py-1 text-[11px] font-bold text-center leading-tight bg-white",
      className,
    ].join(" ")}
  >
    {children}
  </th>
);

// Compute age in years from a dateOfBirth string or Date
function getAge(dob) {
  if (!dob) return "";
  const birth = new Date(dob);
  if (isNaN(birth)) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const notHadBirthdayYet =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (notHadBirthdayYet) age--;
  return age;
}

// Derive final grade letter from average score
function getFinalGrade(avg) {
  const n = Number(avg);
  if (n >= 80) return "A";
  if (n >= 70) return "B";
  if (n >= 60) return "C";
  if (n >= 50) return "D";
  if (n >= 40) return "E";
  return "F";
}

export default function BellaReportCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    const url   = id
      ? `http://localhost:5000/api/results/${id}`
      : `http://localhost:5000/api/results`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((json) => { setData(json); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { loadData(); }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-gray-300 border-t-purple-700 rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading report card…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-300 rounded-lg p-6 max-w-md text-center shadow">
          <p className="text-red-600 font-bold text-sm mb-1">Failed to load report</p>
          <p className="text-gray-500 text-xs mb-1">{error}</p>
          {error.includes("401") && (
            <p className="text-yellow-600 text-xs mt-1">
              Session may have expired. Please{" "}
              <button onClick={() => navigate("/login")} className="underline text-purple-600">
                log in again
              </button>.
            </p>
          )}
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={() => navigate(-1)} className="px-4 py-2 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-50">← Go Back</button>
            <button onClick={loadData} className="px-4 py-2 bg-purple-700 text-white text-xs rounded hover:bg-purple-800">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // Support both single object and array response
  const result = Array.isArray(data) ? data[0] : data;
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">No result data found.</p>
      </div>
    );
  }

  // ── Destructure — matches the shape from resultController & resultModel ──
  const student  = result.student ?? {};
  const subjects = result.subjects ?? [];

  // Dispositions — backend stores as { label, rating }
  const affective   = result.affectiveDispositions      ?? [];
  const psychomotor = result.psychomotorDispositions     ?? [];
  const inclusive   = result.inclusiveLearningActivities ?? [];

  const noOfSubjects  = subjects.filter(s => !s.isHeader).length;
  const finalGrade    = getFinalGrade(result.average);

  // Student name — backend populates either `name` (single field) or firstName/lastName
  const studentName = student.name
    ?? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-2 print:bg-white print:py-0">

      {/* Controls — hidden on print */}
      <div className="flex justify-between items-center mb-4 print:hidden" style={{ maxWidth: "720px", margin: "0 auto 16px" }}>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
          ← Back to Results
        </button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-purple-700 text-white text-sm rounded hover:bg-purple-800">
          Print / Save PDF
        </button>
      </div>

      <div className="bg-white mx-auto shadow-lg print:shadow-none" style={{ width: "720px", fontFamily: "Arial, sans-serif" }}>

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-black">
          <div className="w-16 h-16 flex-shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-pink-400 flex items-center justify-center bg-pink-50 overflow-hidden">
              <img src={logo} alt="school logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1 text-center px-2">
            <h1 className="text-xl font-black tracking-wide text-black uppercase">
              ROYAL GEM MATHEMATICAL SCHOOL
            </h1>
            <p className="text-[10px] text-black mt-0.5">
              No. 6, Main Street, Suncity Estate, Galadimawa District, FCT Abuja.
            </p>
            <p className="text-[10px] text-black">
              Http/:royalgemmathsschool.org. Tel No: 07037199498, 08034091055
            </p>
            <p className="text-[11px] font-bold text-black mt-1 uppercase">
              REPORT SHEET FOR {result.term?.toUpperCase() ?? ""}, {result.session ?? ""} ACADEMIC SESSION.
            </p>
          </div>
          <div className="w-16 h-20 border-2 border-gray-400 flex-shrink-0 overflow-hidden bg-gray-100">
            {student.profilePhoto ? (
              <img src={student.profilePhoto} alt="student" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[8px] text-gray-400 text-center">PHOTO</span>
              </div>
            )}
          </div>
        </div>

        {/* ── STUDENT INFO ── */}
        <div className="grid grid-cols-3 border-b border-black text-[11px]">
          <div className="border-r border-black px-2 py-1 space-y-0.5">
            <p><span className="font-bold">Name: </span>{studentName}</p>
            <p><span className="font-bold">Admission No: </span>{student.regNumber ?? student.admissionNo ?? ""}</p>
            <p><span className="font-bold">Class: </span>{student.classLevel ?? ""}</p>
            <p><span className="font-bold">No. in Class: </span>{result.numberOfStudentsInClass ?? ""}</p>
          </div>
          <div className="border-r border-black px-2 py-1 space-y-0.5">
            <p><span className="font-bold">Total Score: </span>{result.totalScore}</p>
            <p><span className="font-bold">Final Average: </span>{result.average}</p>
            <p><span className="font-bold">Class Average: </span>{result.classAverage ?? ""}</p>
            <p><span className="font-bold">Final Grade: </span>{finalGrade}</p>
          </div>
          <div className="px-2 py-1 space-y-0.5">
            <p><span className="font-bold">Age: </span>{getAge(student.dateOfBirth)}</p>
            <p><span className="font-bold">Sex: </span>{student.gender ?? ""}</p>
            <p><span className="font-bold">Times School Opened: </span>{result.timesSchoolOpened ?? ""}</p>
            <p><span className="font-bold">No of Time(s) Present: </span>{result.timesPresent ?? ""}</p>
          </div>
        </div>

        {/* ── SUBJECTS TABLE ── */}
        <div className="px-2 pt-2">
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr>
                <Th rowSpan={2} className="text-left px-2 w-40">SUBJECT</Th>
                <Th rowSpan={2}>CWK<br />10%</Th>
                <Th rowSpan={2}>HWK<br />10%</Th>
                <Th rowSpan={2}>CA1<br />10%</Th>
                <Th rowSpan={2}>CA 2<br />10%</Th>
                <Th rowSpan={2}>EXAM<br />60%</Th>
                <Th rowSpan={2}>TOTAL<br />SCORE<br />(OVER<br />100)</Th>
                <Th rowSpan={2}>REMARKS</Th>
              </tr>
              <tr />
            </thead>
            <tbody>
              {subjects.map((sub, i) =>
                sub.isHeader ? (
                  <tr key={i}>
                    <td colSpan={8} className="border border-black px-2 py-0.5 text-[11px] font-bold">
                      {sub.name}
                    </td>
                  </tr>
                ) : (
                  <tr key={i}>
                    <Cell bold>{sub.name}</Cell>
                    <Cell center>{sub.cwk}</Cell>
                    <Cell center>{sub.hwk}</Cell>
                    <Cell center>{sub.ca1}</Cell>
                    <Cell center>{sub.ca2}</Cell>
                    <Cell center>{sub.exam}</Cell>
                    <Cell center bold>{sub.total}</Cell>
                    <Cell bold>{sub.remark}</Cell>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* ── GRADING KEY ── */}
        <div className="px-2 pt-2">
          <div className="border border-black p-2 w-full">
            <p className="text-[11px] font-bold underline mb-0.5">NO. OF SUBJECTS: {noOfSubjects}</p>
            <p className="text-[11px] font-bold italic underline mb-0.5">GRADING:</p>
            <p className="text-[11px] italic"><span className="font-bold">A</span> 80 – 100 = Excellent;</p>
            <p className="text-[11px] italic"><span className="font-bold">B</span> 70 – 79 = V.Good;</p>
            <p className="text-[11px] italic"><span className="font-bold">C</span> 60 – 69 = Good;</p>
            <p className="text-[11px] italic"><span className="font-bold">D</span> 50 – 59 = Fair;</p>
            <p className="text-[11px] italic"><span className="font-bold">E</span> 40 – 49 = Poor</p>
            <p className="text-[11px] italic"><span className="font-bold">F</span> 0 – 39 =</p>
          </div>
        </div>

        {/* ── DISPOSITIONS ── */}
        <div className="px-2 pt-2">
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr>
                <Th className="w-1/3">AFFECTIVE DISPOSITIONS</Th>
                <Th className="w-12">RATING</Th>
                <Th className="w-1/3">PSYCHOMOTOR<br />DISPOSITIONS</Th>
                <Th className="w-12">RATING</Th>
                <Th className="w-1/3">INCLUSIVE LEARNING<br />ACTIVITIES</Th>
                <Th className="w-12">RATING</Th>
              </tr>
            </thead>
            <tbody>
              {Array.from({
                length: Math.max(affective.length, psychomotor.length, inclusive.length),
              }).map((_, i) => {
                const a   = affective[i];
                const p   = psychomotor[i];
                const inc = inclusive[i];
                return (
                  <tr key={i}>
                    {/* Backend shape: { label, rating } */}
                    <Cell bold={!!a}>{a?.label ?? ""}</Cell>
                    <Cell center bold={!!a}>{a?.rating ?? ""}</Cell>
                    <Cell bold={!!p}>{p?.label ?? ""}</Cell>
                    <Cell center bold={!!p}>{p?.rating ?? ""}</Cell>
                    <Cell bold={!!inc}>{inc?.label ?? ""}</Cell>
                    <Cell center bold={!!inc}>{inc?.rating ?? ""}</Cell>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── REMARKS, NEXT TERM, STAMP ── */}
        <div className="px-2 pt-2 pb-4">
          <table className="w-full border-collapse border border-black text-[11px]">
            <tbody>
              <tr>
                {/* Remarks rows span left 2/3; signature spans full height on right */}
                <td className="border border-black px-2 py-1 w-3/4">
                  <span className="font-bold">CLASS TEACHER'S REMARK: </span>
                  {result.teacherRemark ?? ""}
                </td>
                <td className="border border-black text-center align-middle" rowSpan={4} style={{ width: "9rem" }}>
                  <img src={signature} alt="signature" className="w-full h-full object-contain" />
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1">
                  <span className="font-bold">HEAD TEACHER'S REMARK: </span>
                  {result.headRemark ?? ""}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1">
                  <span className="font-bold">Next Term Begins: </span>
                  <span className="italic font-bold">{result.nextTermBegins ?? ""}</span>
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-2">
                  <span className="font-bold">STAMP &amp; SIGNATURE: </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}