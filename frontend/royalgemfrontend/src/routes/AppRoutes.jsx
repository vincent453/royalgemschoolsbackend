import { Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import AdminLogin from "../admin/pages/AdminLogin";
import AdminDashboard from "../admin/pages/AdminDashboard";
import ProtectedRoute from "./ProtectedRoutes";
import Student from "../admin/pages/Student";
import AddStudent from "../admin/pages/AddStudent";
import AddTeachers from "../admin/pages/AddTeachers";
import UploadResult from "../admin/pages/UploadResult";
import Teacher from "../admin/pages/Teacher";
import Result from "../admin/pages/Results";
import EditStudent from "../admin/pages/EditStudent";
import Settings from "../admin/pages/Sethings";
import GeneratePin from "../admin/pages/PinGenatration";
import Users from "../admin/pages/Users";
import AddUser from "../admin/pages/AddUsers";
import ResultCard from "../admin/pages/ResultCard";
import Admissions from "../pages/Admission";
export default function AppRoutes() {
  return (
    <Routes>    
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/admin/portal" element={<AdminLogin />} />
         <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute><Student /></ProtectedRoute>} />
        <Route path="/admin/students/add" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
        <Route path="/admin/teachers" element={<ProtectedRoute><Teacher /></ProtectedRoute>} />
        <Route path="/admin/teachers/add" element={<ProtectedRoute><AddTeachers /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/admin/addUsers" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
        <Route path="/admin/results" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/admin/upload" element={<ProtectedRoute><UploadResult /></ProtectedRoute>} />
        <Route path="/admin/students/edit/:id" element={<ProtectedRoute><EditStudent /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/admin/generatepin" element={<ProtectedRoute><GeneratePin /></ProtectedRoute>} />
        <Route path="/admin/results/view/:id" element={<ProtectedRoute><ResultCard /></ProtectedRoute>} />

    </Routes>
  
);
}