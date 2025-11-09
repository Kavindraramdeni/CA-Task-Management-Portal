
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import TaskManagement from './pages/admin/TaskManagement';
import CreateTask from './pages/admin/CreateTask';
import EditTask from './pages/admin/EditTask';
import Analytics from './pages/admin/Analytics';
import PendingApprovals from './pages/admin/PendingApprovals';
import Teams from './pages/admin/Teams';
import Announcements from './pages/admin/Announcements';
import AdminTimesheets from './pages/admin/Timesheets';
import EmployeeLayout from './pages/EmployeeLayout';
import EmployeeDashboard from './pages/employee/Dashboard';
import MyTasks from './pages/employee/MyTasks';
import MyTimesheet from './pages/employee/MyTimesheet';
import { Role } from './types';

const ProtectedRoute: React.FC<{ allowedRoles: Role[] }> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="tasks" element={<TaskManagement />} />
              <Route path="create-task" element={<CreateTask />} />
              <Route path="edit-task/:taskId" element={<EditTask />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="timesheets" element={<AdminTimesheets />} />
              <Route path="approvals" element={<PendingApprovals />} />
              <Route path="teams" element={<Teams />} />
              <Route path="announcements" element={<Announcements />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[Role.EMPLOYEE]} />}>
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="my-tasks" element={<MyTasks />} />
              <Route path="timesheet" element={<MyTimesheet />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
