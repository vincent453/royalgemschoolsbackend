
// Stat Cards
export const statCards = [
  { id: 1, label: "Total Students", value: "1,250", icon: "🎓", bg: "bg-violet-100", change: "+5%", up: true },
  { id: 2, label: "Total Teachers", value: "85",    icon: "👩‍🏫", bg: "bg-orange-100", change: "+2%", up: true },
  { id: 3, label: "Classes",        value: "24",    icon: "🏫", bg: "bg-yellow-100", change: "0%",  up: true },
  { id: 4, label: "Active Students",value: "1,180", icon: "📊", bg: "bg-teal-100", change: "-1%", up: false },
];
// Performance Chart
export const performanceData = {
  labels: ["Test 1", "Test 2", "Mid-Term", "Test 3", "Assignment", "Exam"],
  thisTerm: { value: "68%", data: [55, 60, 70, 65, 75, 80] },
  lastTerm: { value: "64%", data: [50, 58, 65, 60, 70, 75] },
};

// Overview Chart
export const overviewData = {
  labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  enrollment: [200, 250, 300, 350, 400, 420, 430, 450, 470, 500, 520, 550],
  attendance: [180, 230, 280, 320, 370, 390, 400, 420, 440, 470, 490, 510],
  graduates:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 120, 0, 0],
};
// Recent Students
export const recentStudents = [
  { id: 1, name: "Adebayo Samuel", class: "SS2 A", initials: "AS", color: "bg-violet-500" },
  { id: 2, name: "Chiamaka Obi",   class: "JSS3 B", initials: "CO", color: "bg-orange-400" },
  { id: 3, name: "Ibrahim Musa",   class: "SS1 C", initials: "IM", color: "bg-teal-500" },
  { id: 4, name: "Grace John",     class: "JSS2 A", initials: "GJ", color: "bg-yellow-400" },
  { id: 5, name: "Daniel Okeke",   class: "SS3 A", initials: "DO", color: "bg-red-400" },
];
export const messages = [
  { id: 1, name: "Mrs. Aisha Bello", preview: "Please submit your lesson notes...", time: "10:30 AM", initials: "AB", color: "bg-violet-500", unread: true },
  { id: 2, name: "Mr. Emeka Okafor", preview: "Physics test scheduled for Friday", time: "9:15 AM", initials: "EO", color: "bg-orange-400", unread: false },
  { id: 3, name: "Principal",        preview: "Staff meeting by 2PM today", time: "8:00 AM", initials: "PR", color: "bg-teal-500", unread: true },
];
// Teachers
export const teachers = [
  { id: 1, name: "Dr. Aisha Bello",  subject: "Mathematics", class: "SS3 A", students: 42, status: "active" },
  { id: 2, name: "Mr. Emeka Okafor", subject: "Physics",     class: "SS2 B", students: 38, status: "active" },
  { id: 3, name: "Mrs. Ngozi Eze",   subject: "English",     class: "JSS1 C", students: 51, status: "on-leave" },
  { id: 4, name: "Mr. Chidi Amara",  subject: "Chemistry",   class: "SS3 B", students: 37, status: "active" },
  { id: 5, name: "Ms. Fatima Musa",  subject: "Biology",     class: "SS1 A", students: 45, status: "active" },
  { id: 6, name: "Mr. John Doe",     subject: "History",     class: "JSS3 A", students: 40, status: "active" },
  { id: 8, name: "Ms. Jane Smith",   subject: "Geography",   class: "SS2 C", students: 39 , status: "active" },
  { id: 9, name: "Ms. Jane Smith",   subject: "Geography",   class: "SS2 C", students: 39 , status: "active" },
  { id: 10, name: "Ms. Jane Smith",   subject: "Geography",   class: "SS2 C", students: 39 , status: "active" },
  { id: 11, name: "Ms. Jane Smith",   subject: "Geography",   class: "SS2 C", students: 39 , status: "active" },
  { id: 12, name: "Ms. Jane Smith",   subject: "Geography",   class: "SS2 C", students: 39 , status: "active" },

];
// Nav
export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊", href: "/admin/dashboard" },
  { id: "students",  label: "Students",  icon: "🎓", href: "/admin/students" },
  { id: "teachers",  label: "Teachers",  icon: "👩‍🏫", href: "/admin/teachers" },
  { id: "results",   label: "Results",   icon: "📑", href: "/admin/results" },
  { id: "upload",    label: "Upload Results", icon: "⬆️", href: "/admin/upload" },
  { id: "users",     label: "User Accounts", icon: "👤", href: "/admin/users" },
  { id: "generatepin", label: "Generate Pin", icon: "🔑", href: "/admin/generatepin" },
  { id: "settings",  label: "Settings",  icon: "⚙️" , href: "/admin/settings" },
];

export const results = [
  {
    id: 1,
    name: "Jordan Nico",
    studentId: "1234567911",
    class: "XII A",
    fee: 52.03,
    rank: "First",
    img: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 2,
    name: "Karen Hope",
    studentId: "1234567101",
    class: "XI B",
    fee: 45.5,
    rank: "Second",
    img: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: 3,
    name: "Nadila Adja",
    studentId: "1234567001",
    class: "VII C",
    fee: 25.1,
    rank: "Third",
    img: "https://i.pravatar.cc/40?img=3",
  },
  {
    id: 4,
    name: "Samuel Lee",
    studentId: "1234567123",
    class: "IX A",
    fee: 30.0,
    rank: "Fourth",
    img: "https://i.pravatar.cc/40?img=4",
  },
  {
    id: 5,
    name: "Emily Davis",
    studentId: "1234567987",
    class: "X A",
    fee: 40.75,
    rank: "Fifth",
    img: "https://i.pravatar.cc/40?img=5",
  },  
  {
    id: 6,
    name: "Michael Brown",
    studentId: "1234567890",
    class: "VIII B",
    fee: 28.5,
    rank: "Sixth",
    img: "https://i.pravatar.cc/40?img=6",
  },
  {
    id: 7,
    name: "Sophia Wilson",
    studentId: "1234567012",
    class: "XII B",
    fee: 35.0,
    rank: "Seventh",
    img: "https://i.pravatar.cc/40?img=7",
  }

];



export const resultsData = [
  {
    id: 1,
    name: "Samantha William",
    class: "JSS 1",
    term: "First Term",
    total: 450,
    average: "75%",
    status: "Passed",
    grade: "A",
    img: "https://i.pravatar.cc/40?img=5",
  },
  {
    id: 2,
    name: "Tony Soap",
    class: "JSS 2",
    term: "First Term",
    total: 380,
    average: "63%",
    status: "Passed",
    grade: "B",
    img: "https://i.pravatar.cc/40?img=6",
  },  
  {
    id: 3,
    name: "Karen Hope",
    class: "JSS 3",
    term: "First Term",
    total: 420,
    average: "70%",
    status: "Passed",
    grade: "A",
    img: "https://i.pravatar.cc/40?img=7",
  },
  {
    id: 4,
    name: "Nadila Adja",
    class: "JSS 3",
    term: "First Term",
    total: 450,
    average: "75%",
    status: "Passed",
    grade: "A",
    img: "https://i.pravatar.cc/40?img=5",
  },

];