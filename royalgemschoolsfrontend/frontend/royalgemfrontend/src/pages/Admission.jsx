import { useEffect, useRef } from 'react'
import Footer from '../components/layout/Foooter'
import Navbar from '../components/layout/Navbar'

/* ── Royal Gem – Admissions Page ──────────────────────────────────────────
   Design matches the homepage screenshot:
   • Same navbar structure (logo left, links center, search right)
   • Purple / yellow / white palette with lavender section backgrounds
   • Numbered feature cards, icon pills, stat counters
   • Decorative sparkle SVG accents + diagonal dividers
   • Pill-shaped CTA buttons (filled + outlined)
   • Google Fonts: Poppins (headings) + DM Sans (body)
────────────────────────────────────────────────────────────────────────── */

const Sparkle = ({ size = 16, color = '#f5c518', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
  </svg>
)

const Star = ({ style = {} }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={style}>
    <path d="M11 1l2.3 7.1H21l-6.2 4.5 2.4 7.1L11 15.2 4.8 19.7l2.4-7.1L1 8.1h7.7z"
      fill="#f5c518" stroke="#f5c518" strokeWidth="1" strokeLinejoin="round" />
  </svg>
)

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="9" fill="#A033A0" opacity="0.12" />
    <path d="M5 9l3 3 5-5" stroke="#A033A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const steps = [
  {
    num: '01', title: 'Submit Application',
    desc: 'Complete our online or paper application form with your child\'s personal details, previous school records, and parent/guardian information.',
    icon: '📋',
  },
  {
    num: '02', title: 'Document Review',
    desc: 'Our admissions team reviews all submitted documents including birth certificates, last school report cards, and immunisation records.',
    icon: '🔍',
  },
  {
    num: '03', title: 'Entrance Assessment',
    desc: 'Shortlisted candidates sit a brief aptitude and literacy assessment to help us place students in the most suitable class level.',
    icon: '✏️',
  },
  {
    num: '04', title: 'Interview & Visit',
    desc: 'Parents and prospective students are invited for a guided school tour and a brief interview with our head of admissions.',
    icon: '🤝',
  },
  {
    num: '05', title: 'Offer Letter',
    desc: 'Successful candidates receive an official offer letter. A spot is secured upon payment of the acceptance fee within 14 days.',
    icon: '📨',
  },
  {
    num: '06', title: 'Enrolment & Resumption',
    desc: 'Complete school fees payment, collect your child\'s uniform and textbook list, and prepare for the new term.',
    icon: '🎒',
  },
]

const requirements = [
  { label: 'Completed Application Form', note: 'Available at the school office or below' },
  { label: 'Birth Certificate (original + photocopy)', note: '' },
  { label: 'Last two terms\' school reports', note: 'Certified by previous school' },
  { label: 'Passport photographs (4 copies)', note: 'White background, recent' },
  { label: 'Immunisation / Health record card', note: '' },
  { label: 'Parent/Guardian valid ID', note: 'National ID, Passport or Driver\'s Licence' },
  { label: 'Proof of address', note: 'Utility bill not older than 3 months' },
  { label: 'Acceptance & Registration Fees', note: 'Non-refundable, see fee schedule' },
]

const levels = [
  {
    level: 'Primary School', grades: 'Basic 1 – Basic 6', age: 'Ages 5 – 11',
    fee: '₦280,000', period: 'per term',
    color: 'from-purple-100 to-purple-50', accent: '#A033A0',
    perks: ['Qualified class teachers', 'Interactive smart boards', 'Extracurricular clubs', 'Daily feeding programme'],
  },
  {
    level: 'Junior Secondary', grades: 'JSS 1 – JSS 3', age: 'Ages 11 – 14',
    fee: '₦350,000', period: 'per term',
    color: 'from-yellow-50 to-amber-50', accent: '#c9900a',
    perks: ['Specialist subject teachers', 'Science & computer labs', 'Interschool competitions', 'Career orientation'],
    featured: true,
  },
  {
    level: 'Senior Secondary', grades: 'SSS 1 – SSS 3', age: 'Ages 14 – 18',
    fee: '₦420,000', period: 'per term',
    color: 'from-purple-100 to-purple-50', accent: '#A033A0',
    perks: ['WAEC & NECO preparation', 'University counselling', 'Advanced science labs', 'Leadership programmes'],
  },
]

const faqs = [
  {
    q: 'When is the admissions window open?',
    a: 'We accept applications twice a year — before the first term (September) and before the third term (April). However, mid-year transfers are considered on a case-by-case basis subject to available spaces.',
  },
  {
    q: 'Is the entrance assessment compulsory?',
    a: 'Yes. All applicants from JSS 1 upward sit a short assessment. For Primary School entrants, a brief readiness evaluation is conducted with the child in a friendly, low-pressure setting.',
  },
  {
    q: 'Are there scholarships or bursaries available?',
    a: 'Royal Gem offers a merit-based scholarship for exceptional candidates entering JSS 1 and SSS 1. Bursary support is also available for families facing genuine financial hardship. Please enquire at the admissions office.',
  },
  {
    q: 'Can my child join mid-term?',
    a: 'Mid-term entries are assessed individually. We aim to minimise disruption to your child\'s learning, so placements depend on class capacity and the outcome of the entrance assessment.',
  },
  {
    q: 'How long does the admissions process take?',
    a: 'From submission of a complete application to receiving an offer letter typically takes 2–3 weeks during peak periods. Incomplete applications may cause delays.',
  },
]

export default function Admissions() {
  const faqRefs = useRef([])

  const toggleFaq = (i) => {
    const el = faqRefs.current[i]
    const isOpen = el.style.maxHeight && el.style.maxHeight !== '0px'
    faqRefs.current.forEach(r => { if (r) r.style.maxHeight = '0px' })
    if (!isOpen) el.style.maxHeight = el.scrollHeight + 'px'
  }

  useEffect(() => {
    faqRefs.current.forEach(r => { if (r) r.style.maxHeight = '0px' })
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'DM Sans', sans-serif; color: #1a1a2e; background: #fff; }

        .rg-nav {
          position: sticky; top: 0; z-index: 100;
          background: #fff; box-shadow: 0 1px 12px rgba(0,0,0,0.07);
          padding: 0 5%;
          display: flex; align-items: center; justify-content: space-between;
          height: 70px;
        }
        .rg-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .rg-logo-icon {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #A033A0, #7b1fa2);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 15px;
        }
        .rg-logo-text { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 15px; color: #1a1a2e; line-height: 1.2; }
        .rg-logo-text span { color: #A033A0; }

        .rg-nav-links { display: flex; gap: 28px; list-style: none; }
        .rg-nav-links a {
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
          color: #444; text-decoration: none; transition: color .2s;
        }
        .rg-nav-links a:hover, .rg-nav-links a.active { color: #A033A0; }
        .rg-nav-search {
          background: none; border: none; cursor: pointer;
          color: #666; display: flex; align-items: center; gap: 6px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: #888;
        }

        /* ── Hero ── */
        .hero {
          background: linear-gradient(135deg, #f8f0ff 0%, #fff9e6 50%, #f3e8ff 100%);
          padding: 80px 5% 60px;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          position: relative; overflow: hidden;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(160,51,160,0.1); border: 1px solid rgba(160,51,160,0.2);
          border-radius: 100px; padding: 6px 16px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #A033A0;
          margin-bottom: 24px;
        }
        .hero h1 {
          font-family: 'Poppins', sans-serif; font-weight: 800; font-size: clamp(36px, 6vw, 64px);
          line-height: 1.1; color: #1a1a2e; margin-bottom: 20px;
        }
        .hero h1 span { color: #A033A0; }
        .hero p {
          font-size: 16px; color: #666; max-width: 560px; line-height: 1.75; margin-bottom: 36px;
        }
        .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
        .btn-primary {
          background: #A033A0; color: #fff;
          border: 2px solid #A033A0; border-radius: 100px;
          padding: 13px 32px; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px;
          cursor: pointer; text-decoration: none; display: inline-block; transition: all .3s;
        }
        .btn-primary:hover { background: #7b1fa2; border-color: #7b1fa2; transform: translateY(-2px); }
        .btn-outline {
          background: transparent; color: #A033A0;
          border: 2px solid #A033A0; border-radius: 100px;
          padding: 13px 32px; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px;
          cursor: pointer; text-decoration: none; display: inline-block; transition: all .3s;
        }
        .btn-outline:hover { background: rgba(160,51,160,0.07); transform: translateY(-2px); }

        .hero-stats {
          display: flex; gap: 40px; flex-wrap: wrap; justify-content: center;
          margin-top: 56px; padding-top: 40px; border-top: 1px solid rgba(160,51,160,0.12);
          width: 100%;
        }
        .hero-stat { text-align: center; }
        .hero-stat-num {
          font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 32px; color: #A033A0; display: block;
        }
        .hero-stat-label { font-size: 13px; color: #888; display: block; margin-top: 2px; }

        /* ── Generic section wrapper ── */
        section { padding: 80px 5%; }
        .section-tag {
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #A033A0;
          text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 12px; text-align: center;
        }
        .section-title {
          font-family: 'Poppins', sans-serif; font-weight: 800; font-size: clamp(26px, 4vw, 40px);
          color: #1a1a2e; text-align: center; line-height: 1.2; margin-bottom: 14px;
        }
        .section-title span { color: #A033A0; }
        .section-sub {
          font-size: 15px; color: #777; text-align: center; max-width: 540px;
          margin: 0 auto 56px; line-height: 1.8;
        }

        /* ── Steps grid ── */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px; max-width: 1100px; margin: 0 auto;
        }
        .step-card {
          background: #fff; border: 1.5px solid #f0e0f0; border-radius: 20px;
          padding: 32px 28px; position: relative; transition: all .3s;
        }
        .step-card:hover { border-color: #A033A0; transform: translateY(-4px); box-shadow: 0 12px 32px rgba(160,51,160,0.1); }
        .step-num {
          font-family: 'Poppins', sans-serif; font-weight: 900; font-size: 48px;
          color: rgba(160,51,160,0.08); position: absolute; top: 16px; right: 20px; line-height: 1;
        }
        .step-icon { font-size: 32px; margin-bottom: 16px; display: block; }
        .step-title {
          font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 17px;
          color: #1a1a2e; margin-bottom: 10px;
        }
        .step-desc { font-size: 14px; color: #777; line-height: 1.75; }

        /* ── Lavender background sections ── */
        .bg-lavender { background: linear-gradient(135deg, #f8f0ff, #fdf5ff); }
        .bg-yellow { background: linear-gradient(135deg, #fffbeb, #fff9e0); }

        /* ── Requirements ── */
        .req-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px; max-width: 900px; margin: 0 auto;
        }
        .req-item {
          display: flex; align-items: flex-start; gap: 12px;
          background: #fff; border-radius: 14px; padding: 18px 20px;
          border: 1.5px solid #f0e0f0;
        }
        .req-item:hover { border-color: #A033A0; }
        .req-text { flex: 1; }
        .req-label { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px; color: #1a1a2e; }
        .req-note { font-size: 12.5px; color: #999; margin-top: 2px; }

        /* ── Fee cards ── */
        .fee-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px; max-width: 960px; margin: 0 auto;
        }
        .fee-card {
          border-radius: 24px; padding: 36px 30px; border: 2px solid transparent;
          transition: all .3s; position: relative; overflow: hidden;
        }
        .fee-card.featured { border-color: #f5c518; box-shadow: 0 16px 40px rgba(245,197,24,0.2); }
        .fee-card:not(.featured) { border-color: #ede0f5; }
        .fee-card:hover { transform: translateY(-6px); }
        .fee-badge {
          position: absolute; top: 18px; right: 18px;
          background: #f5c518; color: #7a5a00;
          font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 11px;
          border-radius: 100px; padding: 4px 12px;
        }
        .fee-level {
          font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 20px;
          color: #1a1a2e; margin-bottom: 4px;
        }
        .fee-grades { font-size: 13px; color: #999; margin-bottom: 4px; }
        .fee-age { font-size: 13px; color: #bbb; margin-bottom: 28px; }
        .fee-amount {
          font-family: 'Poppins', sans-serif; font-weight: 900; font-size: 36px; line-height: 1;
        }
        .fee-period { font-size: 13px; color: #999; margin-bottom: 28px; }
        .fee-perks { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .fee-perks li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #555; }
        .fee-perks li::before {
          content: '✓'; width: 20px; height: 20px; border-radius: 50%;
          background: rgba(160,51,160,0.1); color: #A033A0;
          display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px;
          flex-shrink: 0;
        }
        .fee-cta {
          margin-top: 28px; width: 100%; text-align: center;
          display: block; padding: 13px; border-radius: 100px;
          font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 14px;
          cursor: pointer; border: 2px solid #A033A0; transition: all .3s; text-decoration: none;
        }
        .fee-cta.primary { background: #A033A0; color: #fff; }
        .fee-cta.primary:hover { background: #7b1fa2; }
        .fee-cta.outline { background: transparent; color: #A033A0; }
        .fee-cta.outline:hover { background: rgba(160,51,160,0.07); }

        /* ── Dates banner ── */
        .dates-banner {
          background: linear-gradient(135deg, #A033A0, #7b1fa2);
          border-radius: 24px; padding: 48px 5%; margin: 0 5%;
          display: flex; flex-wrap: wrap; gap: 32px;
          align-items: center; justify-content: space-between;
        }
        .dates-banner h2 {
          font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 28px;
          color: #fff; margin-bottom: 8px;
        }
        .dates-banner p { font-size: 14px; color: rgba(255,255,255,0.75); max-width: 420px; line-height: 1.7; }
        .dates-grid { display: flex; gap: 20px; flex-wrap: wrap; }
        .date-pill {
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 14px; padding: 16px 22px; text-align: center;
        }
        .date-pill-label { font-size: 11px; color: rgba(255,255,255,0.65); text-transform: uppercase; letter-spacing: 1px; }
        .date-pill-val { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 17px; color: #fff; margin-top: 4px; }

        /* ── FAQs ── */
        .faq-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }
        .faq-item {
          background: #fff; border: 1.5px solid #ede0f5; border-radius: 16px; overflow: hidden;
          transition: border-color .2s;
        }
        .faq-item:hover { border-color: #A033A0; }
        .faq-btn {
          width: 100%; background: none; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 22px 24px; text-align: left;
        }
        .faq-q {
          font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 15px; color: #1a1a2e;
        }
        .faq-icon {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: rgba(160,51,160,0.1); color: #A033A0;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; line-height: 1; transition: transform .3s;
        }
        .faq-body {
          overflow: hidden; max-height: 0; transition: max-height .35s ease;
        }
        .faq-body p { padding: 0 24px 22px; font-size: 14px; color: #666; line-height: 1.8; }

        /* ── CTA section ── */
        .cta-section {
          text-align: center; padding: 96px 5%;
          background: linear-gradient(135deg, #f8f0ff 0%, #fff9e6 60%, #f3e8ff 100%);
        }
        .cta-section h2 {
          font-family: 'Poppins', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 42px);
          color: #1a1a2e; margin-bottom: 16px;
        }
        .cta-section h2 span { color: #A033A0; }
        .cta-section p { font-size: 15px; color: #777; max-width: 480px; margin: 0 auto 36px; line-height: 1.8; }

        /* ── Footer ── */
        footer {
          background: #1a1a2e; color: #aaa; padding: 56px 5% 28px;
        }
        .footer-top {
          display: grid; grid-template-columns: 1.6fr 1fr 1fr 1.2fr; gap: 40px;
          padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .footer-brand p { font-size: 13.5px; line-height: 1.8; margin-top: 14px; color: #888; max-width: 240px; }
        .footer-col h4 {
          font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 14px;
          color: #fff; margin-bottom: 16px;
        }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-col ul li a { font-size: 13.5px; color: #888; text-decoration: none; transition: color .2s; }
        .footer-col ul li a:hover { color: #A033A0; }
        .footer-contact-item { display: flex; gap: 10px; margin-bottom: 12px; font-size: 13.5px; color: #888; }
        .footer-bottom {
          padding-top: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: gap;
          font-size: 12.5px; color: #555;
        }

        /* ── Decorative ── */
        .deco { position: absolute; pointer-events: none; }

        @media (max-width: 768px) {
          .rg-nav-links { display: none; }
          .footer-top { grid-template-columns: 1fr 1fr; }
          .dates-banner { flex-direction: column; margin: 0 4%; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <div className='mt-[6rem]'>
        <Navbar />
        </div>
      {/* ── Hero ── */}
      <div className="hero">
        {/* decorative sparkles */}
        <Sparkle size={20} color="#f5c518" style={{ position:'absolute', top:40, left:'8%' }} />
        <Sparkle size={12} color="#A033A0" style={{ position:'absolute', top:100, left:'15%' }} />
        <Sparkle size={24} color="#f5c518" style={{ position:'absolute', top:60, right:'10%' }} />
        <Sparkle size={14} color="#A033A0" style={{ position:'absolute', bottom:80, right:'18%' }} />
        <Star style={{ position:'absolute', bottom:60, left:'12%' }} />

        <span className="hero-badge">
          <svg width="14" height="14" fill="#A033A0" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg>
          2025/2026 Admissions — Now Open
        </span>

        <h1>Begin Your Child's<br /><span>Extraordinary Journey</span></h1>
        <p>
          Royal Gem Mathematical School offers a nurturing, academically rich environment
          where every student is empowered to discover their potential and thrive.
        </p>
        <div className="hero-btns">
          <a href="#apply" className="btn-primary">Apply Now</a>
          <a href="#process" className="btn-outline">See Admission Process</a>
        </div>

        <div className="hero-stats">
          {[
            { num: '300+', label: 'Happy Students' },
            { num: '1,200+', label: 'Alumni Network' },
            { num: '50+', label: 'Expert Teachers' },
            { num: '10+', label: 'Years of Excellence' },
          ].map(s => (
            <div className="hero-stat" key={s.label}>
              <span className="hero-stat-num">{s.num}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Why Choose Us ── */}
      <section>
        <span className="section-tag">Why Royal Gem?</span>
        <h2 className="section-title">A School That <span>Truly Cares</span></h2>
        <p className="section-sub">
          We go beyond textbooks — building character, confidence, and critical thinking in every child.
        </p>
        <div className="steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {[
            { num:'01', icon:'🏅', title:'Qualified Teachers', desc:'Certified educators dedicated to your child\'s academic and personal growth.' },
            { num:'02', icon:'📚', title:'Quality Education', desc:'Up-to-date curriculum aligned with national and international standards.' },
            { num:'03', icon:'🌿', title:'Moral Values', desc:'We instil discipline, respect and integrity alongside academic achievement.' },
            { num:'04', icon:'🖥️', title:'Modern Classrooms', desc:'Smart boards, science labs and digital tools for 21st-century learning.' },
          ].map(c => (
            <div className="step-card" key={c.num}>
              <span className="step-num">{c.num}</span>
              <span className="step-icon">{c.icon}</span>
              <div className="step-title">{c.title}</div>
              <div className="step-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Admissions Process ── */}
      <section className="bg-lavender" id="process">
        <span className="section-tag">Step by Step</span>
        <h2 className="section-title">Our <span>Admissions Process</span></h2>
        <p className="section-sub">
          We've made our admissions journey simple and transparent. Here's exactly what to expect.
        </p>
        <div className="steps-grid">
          {steps.map(s => (
            <div className="step-card" key={s.num}>
              <span className="step-num">{s.num}</span>
              <span className="step-icon">{s.icon}</span>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Important Dates banner ── */}
      <div style={{ padding: '60px 0', background: '#fff' }}>
        <div className="dates-banner">
          <div>
            <Sparkle size={14} color="#f5c518" style={{ marginBottom: 12 }} />
            <h2>2025/2026 Key Dates</h2>
            <p>Mark your calendar — don't miss the application windows for each term of the new academic year.</p>
          </div>
          <div className="dates-grid">
            {[
              { label: 'Term 1 Opens', val: '1 July 2025' },
              { label: 'Term 1 Closes', val: '15 Aug 2025' },
              { label: 'Term 2 Opens', val: '3 Nov 2025' },
              { label: 'Term 2 Closes', val: '10 Dec 2025' },
              { label: 'Resumption', val: '8 Sep 2025' },
            ].map(d => (
              <div className="date-pill" key={d.label}>
                <div className="date-pill-label">{d.label}</div>
                <div className="date-pill-val">{d.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Requirements ── */}
      <section id="requirements">
        <span className="section-tag">Checklist</span>
        <h2 className="section-title">Required <span>Documents</span></h2>
        <p className="section-sub">
          Please ensure all documents are ready before starting your application to avoid delays.
        </p>
        <div className="req-grid">
          {requirements.map((r, i) => (
            <div className="req-item" key={i}>
              <CheckIcon />
              <div className="req-text">
                <div className="req-label">{r.label}</div>
                {r.note && <div className="req-note">{r.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fee Schedule ── */}
      <section className="bg-yellow" id="fees">
        <span className="section-tag">School Fees</span>
        <h2 className="section-title">Transparent <span>Fee Structure</span></h2>
        <p className="section-sub">
          All fees are clearly stated with no hidden charges. Payment plans are available upon request.
        </p>
        <div className="fee-grid">
          {levels.map(l => (
            <div className={`fee-card ${l.featured ? 'featured' : ''}`}
              style={{ background: `linear-gradient(135deg, ${l.featured ? '#fffbeb, #fff9e0' : '#f8f0ff, #fdf5ff'})` }}
              key={l.level}>
              {l.featured && <span className="fee-badge">⭐ Most Popular</span>}
              <div className="fee-level">{l.level}</div>
              <div className="fee-grades">{l.grades}</div>
              <div className="fee-age">{l.age}</div>
              <div className="fee-amount" style={{ color: l.accent }}>{l.fee}</div>
              <div className="fee-period">{l.period}</div>
              <ul className="fee-perks">
                {l.perks.map(p => <li key={p}>{p}</li>)}
              </ul>
              <a href="#apply" className={`fee-cta ${l.featured ? 'primary' : 'outline'}`}>Apply for This Level</a>
            </div>
          ))}
        </div>
        <p style={{ textAlign:'center', marginTop:28, fontSize:13, color:'#aaa' }}>
          * Fees exclude uniform, textbooks and optional extracurricular activities.
          Contact the bursary for a full breakdown.
        </p>
      </section>

      {/* ── FAQ ── */}
      <section>
        <span className="section-tag">Got Questions?</span>
        <h2 className="section-title">Frequently Asked <span>Questions</span></h2>
        <p className="section-sub">Everything you need to know about joining the Royal Gem family.</p>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div className="faq-item" key={i}>
              <button className="faq-btn" onClick={() => toggleFaq(i)}>
                <span className="faq-q">{f.q}</span>
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-body" ref={el => faqRefs.current[i] = el}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <div className="cta-section" id="apply">
        <Sparkle size={18} color="#f5c518" style={{ display:'inline-block', marginBottom:16 }} />
        <h2>Ready to Join the<br /><span>Royal Gem Family?</span></h2>
        <p>
          Take the first step towards your child's bright future.
          Our admissions team is ready to guide you through every step.
        </p>
        <div className="hero-btns">
          <a href="#" className="btn-primary">Download Application Form</a>
          <a href="#" className="btn-outline">Contact Admissions Office</a>
        </div>
        <div style={{ marginTop:32, display:'flex', gap:28, justifyContent:'center', flexWrap:'wrap' }}>
          {[
            { icon:'📞', text:'08012345678' },
            { icon:'📧', text:'admissions@royalgem.edu.ng' },
            { icon:'📍', text:'123 School Road, Lagos, Nigeria' },
          ].map(c => (
            <span key={c.text} style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, color:'#666' }}>
              <span>{c.icon}</span>{c.text}
            </span>
          ))}
        </div>
      </div>
      <div className='mt-20'>
        <Footer />
        </div>
    </>
  )
}