import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import { useState, useEffect } from 'react'
import { FaPlus, FaTrash } from 'react-icons/fa'

const classes   = ['All Classes','JSS 1','JSS 2','JSS 3','SSS 1','SSS 2','SSS 3','Kindergarten','Nursery 1','Nursery 2']
const terms     = ['1st Term','2nd Term','3rd Term']
const sessions  = ['2023/2024','2024/2025','2025/2026']
const sortOptions = [
  { value: 'name-asc',  label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'class',     label: 'Class'       },
  { value: 'reg',       label: 'Reg No.'     },
]

const defaultSubject = { name: '', cwk: '', hwk: '', ca1: '', ca2: '', exam: '' }

const DEFAULT_AFFECTIVE = [
  { label: 'Punctuality',                    rating: '' },
  { label: 'Neatness',                       rating: '' },
  { label: 'Comportment in Class',           rating: '' },
  { label: 'Organisation',                   rating: '' },
  { label: 'Promptness to Complete Work',    rating: '' },
  { label: 'Creativity',                     rating: '' },
  { label: 'Relationship with Other Pupils', rating: '' },
]

const DEFAULT_PSYCHOMOTOR = [
  { label: 'Handwriting',                    rating: '' },
  { label: 'Games / Sports',                 rating: '' },
  { label: 'Handling of Learning Materials', rating: '' },
  { label: 'Public Speaking',                rating: '' },
]

const DEFAULT_INCLUSIVE = [
  { label: 'Practical Life Exercise', rating: '' },
  { label: 'Reading',                 rating: '' },
  { label: 'Circle Time',             rating: '' },
]

const UploadResult = () => {
  // ── Student selection ──
  const [filterClass, setFilterClass] = useState('All Classes')
  const [sortBy, setSortBy]           = useState('name-asc')
  const [student, setStudent]         = useState('')
  const [term, setTerm]               = useState('')
  const [session, setSession]         = useState('')

  // ── Subjects ──
  const [subjects, setSubjects] = useState([{ ...defaultSubject }])

  // ── Attendance ──
  const [timesSchoolOpened,       setTimesSchoolOpened]       = useState('')
  const [timesPresent,            setTimesPresent]            = useState('')
  const [numberOfStudentsInClass, setNumberOfStudentsInClass] = useState('')

  // ── Dispositions ──
  const [affective,   setAffective]   = useState(DEFAULT_AFFECTIVE.map(d => ({ ...d })))
  const [psychomotor, setPsychomotor] = useState(DEFAULT_PSYCHOMOTOR.map(d => ({ ...d })))
  const [inclusive,   setInclusive]   = useState(DEFAULT_INCLUSIVE.map(d => ({ ...d })))

  // ── Remarks & next term ──
  const [teacherRemark,  setTeacherRemark]  = useState('')
  const [headRemark,     setHeadRemark]     = useState('')
  const [nextTermBegins, setNextTermBegins] = useState('')

  // ── Students list ──
  const [students,        setStudents]        = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  // ── Submission state ──
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error,   setError]   = useState('')

  // ── Fetch students ──
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true)
        const token = localStorage.getItem('token')
        const res  = await fetch('http://localhost:5000/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        setStudents(data)
      } catch (err) {
        console.error('Failed to fetch students:', err.message)
      } finally {
        setLoadingStudents(false)
      }
    }
    fetchStudents()
  }, [])

  const filteredStudents = students
    .filter(s => filterClass === 'All Classes' ? true : s.classLevel === filterClass)
    .sort((a, b) => {
      if (sortBy === 'name-asc')  return a.firstName.localeCompare(b.firstName)
      if (sortBy === 'name-desc') return b.firstName.localeCompare(a.firstName)
      if (sortBy === 'class')     return a.classLevel.localeCompare(b.classLevel)
      if (sortBy === 'reg')       return a.regNumber.localeCompare(b.regNumber)
      return 0
    })

  // ── Subject helpers ──
  const addSubject    = () => setSubjects([...subjects, { ...defaultSubject }])
  const removeSubject = (i) => setSubjects(subjects.filter((_, idx) => idx !== i))
  const updateSubject = (i, field, value) => {
    const updated = [...subjects]
    updated[i][field] = value
    setSubjects(updated)
  }

  // ── Disposition helpers ──
  const updateRating = (setter, index, value) => {
    setter(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], rating: value }
      return updated
    })
  }

  // ── Reset form ──
  const resetForm = () => {
    setStudent(''); setTerm(''); setSession('')
    setSubjects([{ ...defaultSubject }])
    setTimesSchoolOpened(''); setTimesPresent('')
    setNumberOfStudentsInClass('')
    setAffective(DEFAULT_AFFECTIVE.map(d => ({ ...d })))
    setPsychomotor(DEFAULT_PSYCHOMOTOR.map(d => ({ ...d })))
    setInclusive(DEFAULT_INCLUSIVE.map(d => ({ ...d })))
    setTeacherRemark(''); setHeadRemark(''); setNextTermBegins('')
    setError(''); setSuccess('')
  }

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')

    try {
      const token = localStorage.getItem('token')

      const payload = {
        studentId: student,
        term,
        session,
        subjects,
        classAverage:            undefined, // auto-computed server-side
        timesSchoolOpened:       Number(timesSchoolOpened)       || 0,
        timesPresent:            Number(timesPresent)            || 0,
        numberOfStudentsInClass: Number(numberOfStudentsInClass) || 0,
        affectiveDispositions:      affective.map(d => ({ label: d.label, rating: Number(d.rating) || null })),
        psychomotorDispositions:    psychomotor.map(d => ({ label: d.label, rating: Number(d.rating) || null })),
        inclusiveLearningActivities: inclusive.map(d => ({ label: d.label, rating: Number(d.rating) || null })),
        teacherRemark,
        headRemark,
        nextTermBegins,
      }

      const res  = await fetch('http://localhost:5000/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setSuccess('Result uploaded successfully!')
      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Shared styles ──
  const inputClass = `w-full border border-gray-200 rounded-lg px-4 py-2.5
                      font-dm-sans text-gray-700 text-sm placeholder-gray-300
                      focus:outline-none focus:border-[#A033A0] transition-colors duration-300`
  const labelClass = `font-dm-sans text-[#A033A0] text-sm font-semibold mb-1 block`
  const sectionClass = `bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4`
  const headingClass = `font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3`

  // ── Rating input (1–5) ──
  const RatingInput = ({ value, onChange }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputClass}>
      <option value="">—</option>
      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
    </select>
  )

  // ── Disposition table ──
  const DispositionTable = ({ title, data, setter }) => (
    <div className="flex flex-col gap-3">
      <h3 className="font-dm-sans text-gray-500 text-xs font-semibold uppercase tracking-widest">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="font-dm-sans text-gray-700 text-sm flex-1">{item.label}</span>
            <div className="w-24">
              <RatingInput value={item.rating} onChange={val => updateRating(setter, i, val)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">
      <div className="sticky top-0 z-50 w-full"><Topbar /></div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16"><Slidebar /></div>

        <main className="w-full overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">

            {/* ── 1. Select Student ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Select Student</h2>

              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                  <label className={labelClass}>Filter by Class</label>
                  <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className={inputClass}>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                  <label className={labelClass}>Sort By</label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={inputClass}>
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1 flex-[2] min-w-[200px]">
                  <label className={labelClass}>Student *</label>
                  <select value={student} onChange={e => setStudent(e.target.value)} className={inputClass} required>
                    <option value="">
                      {loadingStudents ? 'Loading...' : `-- Select Student (${filteredStudents.length} available) --`}
                    </option>
                    {filteredStudents.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName} — {s.classLevel} ({s.regNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Term *</label>
                  <select value={term} onChange={e => setTerm(e.target.value)} className={inputClass} required>
                    <option value="">Select Term</option>
                    {terms.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Session *</label>
                  <select value={session} onChange={e => setSession(e.target.value)} className={inputClass} required>
                    <option value="">Select Session</option>
                    {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── 2. Attendance & Class Info ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Attendance & Class Info</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Times School Opened', value: timesSchoolOpened, setter: setTimesSchoolOpened },
                  { label: 'Times Present',        value: timesPresent,      setter: setTimesPresent      },
                  { label: 'No. in Class',         value: numberOfStudentsInClass, setter: setNumberOfStudentsInClass },
                ].map(({ label, value, setter }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <label className={labelClass}>{label}</label>
                    <input
                      type="number" min={0}
                      value={value}
                      onChange={e => setter(e.target.value)}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── 3. Subjects & Scores ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Subjects & Scores</h2>

              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3">
                {['Subject Name *','CWK (0–10) *','HWK (0–10) *','CA1 (0–10) *','CA2 (0–10) *','Exam (0–60) *',''].map((h, i) => (
                  <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</span>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                {subjects.map((sub, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center">
                    <input type="text"   placeholder="e.g. Mathematics" value={sub.name} onChange={e => updateSubject(i,'name',e.target.value)} className={inputClass} required />
                    <input type="number" placeholder="0–10" min={0} max={10} value={sub.cwk}  onChange={e => updateSubject(i,'cwk',e.target.value)}  className={inputClass} required />
                    <input type="number" placeholder="0–10" min={0} max={10} value={sub.hwk}  onChange={e => updateSubject(i,'hwk',e.target.value)}  className={inputClass} required />
                    <input type="number" placeholder="0–10" min={0} max={10} value={sub.ca1}  onChange={e => updateSubject(i,'ca1',e.target.value)}  className={inputClass} required />
                    <input type="number" placeholder="0–10" min={0} max={10} value={sub.ca2}  onChange={e => updateSubject(i,'ca2',e.target.value)}  className={inputClass} required />
                    <input type="number" placeholder="0–60" min={0} max={60} value={sub.exam} onChange={e => updateSubject(i,'exam',e.target.value)} className={inputClass} required />
                    <button type="button" onClick={() => removeSubject(i)} disabled={subjects.length === 1}
                      className="text-red-400 hover:text-red-600 disabled:opacity-20 transition-colors duration-300 flex items-center justify-center">
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addSubject}
                className="flex items-center gap-2 text-[#A033A0] hover:text-[#525fe1] font-dm-sans font-semibold text-sm transition-colors duration-300 w-fit">
                <FaPlus className="text-xs" /> Add Another Subject
              </button>
            </div>

            {/* ── 4. Dispositions ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Dispositions & Activities <span className="text-xs font-normal text-gray-400">(Rate 1–5)</span></h2>
              <div className="flex flex-col gap-6">
                <DispositionTable title="Affective Dispositions"        data={affective}   setter={setAffective}   />
                <DispositionTable title="Psychomotor Dispositions"      data={psychomotor} setter={setPsychomotor} />
                <DispositionTable title="Inclusive Learning Activities" data={inclusive}   setter={setInclusive}   />
              </div>
            </div>

            {/* ── 5. Remarks & Next Term ── */}
            <div className={sectionClass}>
              <h2 className={headingClass}>Remarks & Next Term</h2>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className={labelClass}>Class Teacher's Remark</label>
                  <textarea rows={3} placeholder="Enter teacher's remark..." value={teacherRemark} onChange={e => setTeacherRemark(e.target.value)} className={`${inputClass} resize-none`} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className={labelClass}>Head Teacher's Remark</label>
                  <textarea rows={3} placeholder="Enter head teacher's remark..." value={headRemark} onChange={e => setHeadRemark(e.target.value)} className={`${inputClass} resize-none`} />
                </div>
              </div>

              <div className="flex flex-col gap-1 max-w-xs">
                <label className={labelClass}>Next Term Begins</label>
                <input type="text" placeholder="e.g. Monday, 4th May 2026" value={nextTermBegins} onChange={e => setNextTermBegins(e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* ── Feedback ── */}
            {error   && <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl text-sm font-medium font-dm-sans">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-medium font-dm-sans">{success}</div>}

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-4 pb-6">
              <button type="button" onClick={resetForm}
                className="font-jost font-semibold px-8 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:border-[#A033A0] hover:text-[#A033A0] transition-all duration-300">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className={`font-jost font-semibold px-8 py-2.5 rounded-full text-white transition-colors duration-500 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#A033A0] hover:bg-[#525fe1]'}`}>
                {loading ? 'Uploading...' : 'Upload Result'}
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  )
}

export default UploadResult