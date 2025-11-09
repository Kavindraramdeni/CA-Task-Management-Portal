import React from 'react';
import { LayoutDashboard, ListTodo, PlusCircle, BarChart2, ClipboardCheck, Users, Megaphone, Clock } from 'lucide-react';

export const ADMIN_NAV_LINKS = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Task Management', path: '/admin/tasks', icon: <ListTodo size={20} /> },
    { name: 'Create Task', path: '/admin/create-task', icon: <PlusCircle size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Timesheets', path: '/admin/timesheets', icon: <Clock size={20} /> },
    { name: 'Approvals', path: '/admin/approvals', icon: <ClipboardCheck size={20} /> },
    { name: 'Teams', path: '/admin/teams', icon: <Users size={20} /> },
    { name: 'Announcements', path: '/admin/announcements', icon: <Megaphone size={20} /> },
];

export const EMPLOYEE_NAV_LINKS = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Tasks', path: '/employee/my-tasks', icon: <ListTodo size={20} /> },
    { name: 'My Timesheet', path: '/employee/timesheet', icon: <Clock size={20} /> },
];