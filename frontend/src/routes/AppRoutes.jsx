import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Loading from "../components/common/Loading.jsx";

import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Hackathon from "../pages/Hackathon.jsx";
import TaskBoard from "../pages/TaskBoard.jsx";
import Calendar from "../pages/Calendar.jsx";
import Git from "../pages/Git.jsx";
import Submission from "../pages/Submission.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Loading label="Checking your session…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/hackathons" element={<ProtectedRoute><Hackathon /></ProtectedRoute>} />
      <Route path="/hackathons/:hackathonId" element={<ProtectedRoute><Hackathon /></ProtectedRoute>} />
      <Route path="/hackathons/:hackathonId/tasks" element={<ProtectedRoute><TaskBoard /></ProtectedRoute>} />
      <Route path="/hackathons/:hackathonId/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/hackathons/:hackathonId/git" element={<ProtectedRoute><Git /></ProtectedRoute>} />
      <Route path="/hackathons/:hackathonId/submission" element={<ProtectedRoute><Submission /></ProtectedRoute>} />
      <Route path="/tasks" element={<Navigate to="/hackathons" replace />} />
      <Route path="/calendar" element={<Navigate to="/hackathons" replace />} />
      <Route path="/git" element={<Navigate to="/hackathons" replace />} />
      <Route path="/submission" element={<Navigate to="/hackathons" replace />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
