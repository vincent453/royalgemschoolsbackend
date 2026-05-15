import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import { useState } from 'react'
import { FaKey, FaCopy, FaDownload, FaRedo, FaCheckCircle } from 'react-icons/fa'

const classes = ['All Classes', 'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3']
const sessions = ['2023/2024', '2024/2025', '2025/2026']
const terms    = ['1st Term', '2nd Term', '3rd Term']
const pinTypes = ['Single Student', 'Entire Class', 'Multiple Students']
const sortOptions = [
  { value: 'name-asc',  label: 'Name (A–Z)'  },
  { value: 'name-desc', label: 'Name (Z–A)'  },
  { value: 'class',     label: 'Class'        },
  { value: 'reg',       label: 'Reg No.'      },
]

// Mock generated PINs for preview
const mockPins = [
  { reg: 'JSS1/001', name: 'Adaeze Okonkwo',   class: 'JSS 1', pin: '7X4K-9M2P' },
  { reg: 'JSS1/002', name: 'Emeka Nwosu',       class: 'JSS 1', pin: '3R8T-6N1Q' },
  { reg: 'JSS1/003', name: 'Fatima Bello',      class: 'JSS 1', pin: '5W2J-8L4V' },
  { reg: 'JSS1/004', name: 'Chukwuemeka Eze',  class: 'JSS 1', pin: '1D9H-7C5B' },
]

const GeneratePin = () => {
  const [filterClass, setFilterClass]   = useState('All Classes')
  const [sortBy, setSortBy]             = useState('name-asc')
  const [pinType, setPinType]           = useState('Single Student')
  const [student, setStudent]           = useState('')
  const [term, setTerm]                 = useState('')
  const [session, setSession]           = useState('')
  const [pinLength, setPinLength]       = useState('8')
  const [quantity, setQuantity]         = useState('1')
  const [generated, setGenerated]       = useState(false)
  const [copied, setCopied]             = useState(null)
  const [pins, setPins]                 = useState([])

  const inputClass = `w-full border border-gray-200 rounded-lg px-4 py-2.5
                      font-dm-sans text-gray-700 text-sm placeholder-gray-300
                      focus:outline-none focus:border-[#A033A0] transition-colors duration-300`

  const labelClass = `font-dm-sans text-[#A033A0] text-sm font-semibold mb-1 block`

  const handleGenerate = (e) => {
    e.preventDefault()
    setPins(mockPins)
    setGenerated(true)
  }

  const handleCopy = (pin, idx) => {
    navigator.clipboard.writeText(pin)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCopyAll = () => {
    const all = pins.map(p => `${p.name} (${p.reg}): ${p.pin}`).join('\n')
    navigator.clipboard.writeText(all)
    setCopied('all')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleReset = () => {
    setGenerated(false)
    setPins([])
    setStudent('')
    setTerm('')
    setSession('')
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">

      {/* Topbar */}
      <div className="sticky top-0 z-50 w-full">
        <Topbar />
      </div>

      {/* Below topbar: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="-mt-16">
          <Slidebar />
        </div>

        {/* Scrollable content */}
        <main className="w-full overflow-y-auto">
          <form onSubmit={handleGenerate} className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">

            {/* ── Section 1: PIN Configuration ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                PIN Configuration
              </h2>

              {/* PIN Type + Length + Quantity */}
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1 flex-[2] min-w-[180px]">
                  <label className={labelClass}>PIN Type *</label>
                  <select
                    value={pinType}
                    onChange={(e) => { setPinType(e.target.value); setGenerated(false); setPins([]) }}
                    className={inputClass}
                    required
                  >
                    {pinTypes.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                  <label className={labelClass}>PIN Length</label>
                  <select
                    value={pinLength}
                    onChange={(e) => setPinLength(e.target.value)}
                    className={inputClass}
                  >
                    {['6', '8', '10', '12'].map((l) => (
                      <option key={l} value={l}>{l} characters</option>
                    ))}
                  </select>
                </div>

                {pinType !== 'Single Student' && (
                  <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                    <label className={labelClass}>Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 30"
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 2: Select Student / Class ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
              <h2 className="font-jost font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">
                {pinType === 'Single Student' ? 'Select Student' : 'Select Class'}
              </h2>

              {/* Filter + Sort row */}
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                  <label className={labelClass}>Filter by Class</label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className={inputClass}
                  >
                    {classes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {pinType === 'Single Student' && (
                  <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                    <label className={labelClass}>Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={inputClass}
                    >
                      {sortOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {pinType === 'Single Student' && (
                  <div className="flex flex-col gap-1 flex-[2] min-w-[200px]">
                    <label className={labelClass}>Student *</label>
                    <select
                      value={student}
                      onChange={(e) => setStudent(e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="">-- Select Student --</option>
                      <option disabled className="text-gray-400">367 students available</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Term + Session */}
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Term *</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">Select Term</option>
                    {terms.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className={labelClass}>Session *</label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">Select Session</option>
                    {sessions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section 3: Generated PINs (shown after generation) ── */}
            {generated && pins.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="font-jost font-bold text-gray-800 text-lg">
                    Generated PINs
                    <span className="ml-2 text-sm font-dm-sans font-normal text-gray-400">
                      ({pins.length} PIN{pins.length > 1 ? 's' : ''})
                    </span>
                  </h2>
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 text-sm font-dm-sans font-semibold
                               text-[#A033A0] hover:text-[#525fe1] transition-colors duration-300"
                  >
                    {copied === 'all'
                      ? <><FaCheckCircle className="text-green-500" /> Copied!</>
                      : <><FaCopy className="text-xs" /> Copy All</>
                    }
                  </button>
                </div>

                {/* Column headers */}
                <div className="hidden md:grid grid-cols-[auto_2fr_1fr_1fr_auto] gap-3">
                  {['Reg No.', 'Student Name', 'Class', 'PIN', ''].map((h, i) => (
                    <span key={i} className="font-dm-sans text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      {h}
                    </span>
                  ))}
                </div>

                {/* PIN rows */}
                <div className="flex flex-col gap-2">
                  {pins.map((p, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 md:grid-cols-[auto_2fr_1fr_1fr_auto] gap-3
                                 items-center bg-[#faf5ff] rounded-xl px-4 py-3
                                 border border-[#f0e0f0]"
                    >
                      <span className="font-dm-sans text-xs text-gray-400">{p.reg}</span>
                      <span className="font-dm-sans text-sm font-semibold text-gray-700">{p.name}</span>
                      <span className="font-dm-sans text-sm text-gray-500">{p.class}</span>
                      <span className="font-jost font-bold text-[#A033A0] tracking-widest text-sm">
                        {p.pin}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(p.pin, i)}
                        className="text-gray-400 hover:text-[#A033A0] transition-colors duration-300
                                   flex items-center justify-center"
                        title="Copy PIN"
                      >
                        {copied === i
                          ? <FaCheckCircle className="text-green-500 text-sm" />
                          : <FaCopy className="text-sm" />
                        }
                      </button>
                    </div>
                  ))}
                </div>

                {/* Info note */}
                <p className="font-dm-sans text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3">
                  ⚠️ These PINs are valid for the selected term and session only. Share them securely with students or guardians.
                </p>
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-4 pb-6">
              {generated ? (
                <>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full
                               border border-gray-300 text-gray-600 hover:border-[#A033A0]
                               hover:text-[#A033A0] transition-all duration-300"
                  >
                    <FaRedo className="text-xs" />
                    Reset
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full
                               border border-[#A033A0] text-[#A033A0] hover:bg-[#faf5ff]
                               transition-all duration-300"
                  >
                    <FaDownload className="text-xs" />
                    Download PINs
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full
                               bg-[#A033A0] hover:bg-[#525fe1] text-white
                               transition-colors duration-500"
                  >
                    <FaRedo className="text-xs" />
                    Regenerate
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="font-jost font-semibold px-8 py-2.5 rounded-full border
                               border-gray-300 text-gray-600 hover:border-[#A033A0]
                               hover:text-[#A033A0] transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 font-jost font-semibold px-8 py-2.5 rounded-full
                               bg-[#A033A0] hover:bg-[#525fe1] text-white
                               transition-colors duration-500"
                  >
                    <FaKey className="text-xs" />
                    Generate PIN
                  </button>
                </>
              )}
            </div>

          </form>
        </main>

      </div>
    </div>
  );
};

export default GeneratePin;