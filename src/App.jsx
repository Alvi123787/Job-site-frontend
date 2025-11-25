import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css'
import Jobs from './pages/Jobs';
import Contact from './pages/Contact';
import About from './pages/About';
import Footer from './components/Footer';
import JobDetail from './pages/JobDetail';
import BlogPage from './pages/BlogPage';
import BlogDetail from './pages/BlogDetail';
import BlogPostForm from './components/BlogPostForm';
import AdminRoute from './components/AdminRoute';
import AdminPanel from './pages/AdminPanel';
import JobEditPage from './pages/JobEditPage';
import AdminRecentBlogs from './pages/AdminRecentBlogs';
import AdminRecentJobs from './pages/AdminRecentJobs';
import BlogEditPage from './pages/BlogEditPage';
import CalendarPage from './pages/CalendarPage';
import SavedItems from './pages/SavedItems';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminAbout from './pages/AdminAbout';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/admin/about" element={<AdminRoute><AdminAbout /></AdminRoute>} />
          <Route path="/admin/jobs/:id/edit" element={<AdminRoute><JobEditPage /></AdminRoute>} />
          <Route path="/admin/recent-blogs" element={<AdminRoute><AdminRecentBlogs /></AdminRoute>} />
          <Route path="/admin/recent-jobs" element={<AdminRoute><AdminRecentJobs /></AdminRoute>} />
          <Route path="/admin/blogs/:id/edit" element={<AdminRoute><BlogEditPage /></AdminRoute>} />
          <Route path="/admin/calendar" element={<AdminRoute><CalendarPage /></AdminRoute>} />
          <Route path="/admin/blog/new" element={<AdminRoute><BlogPostForm /></AdminRoute>} />
          <Route path="/saved" element={<SavedItems />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </Router>
      <Footer />
    </>
  )
}

export default App
