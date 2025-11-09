

import React, { useEffect, useState, useCallback } from 'react';
import DashboardCard from '../../components/DashboardCard';
import { ListTodo, CheckCircle, Clock, ClipboardCheck, Edit } from 'lucide-react';
import api from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import TaskTable from '../../components/TaskTable';
import { Task, User } from '../../types';
import { Link } from 'react-router-dom';

const SkeletonCard: React.FC = () => (
    <div className="bg-dark-component rounded-lg p-5 animate-pulse border border-dark-border">
        <div className="h-4 bg-dark-border rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-dark-border rounded w-1/2"></div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, pendingApprovals: 0 });
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (user) {
            setLoading(true);
            const [statsData, tasksData, usersData] = await Promise.all([
                api.getDashboardStats(user._id, user.role),
                api.getTasks(),
                api.getAllUsers()
            ]);
            setStats(statsData as any);
            setRecentTasks(tasksData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
            setUsers(usersData);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderTaskActions = (task: Task) => (
        <div className="flex space-x-2">
            <Link to={`/admin/edit-task/${task._id}`} className="p-1 text-secondary hover:text-primary" title="Edit Task"><Edit size={16} /></Link>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <div className="bg-dark-component rounded-lg p-6 animate-pulse border border-dark-border">
                    <div className="h-6 bg-dark-border rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-8 bg-dark-border rounded"></div>
                        <div className="h-8 bg-dark-border rounded"></div>
                        <div className="h-8 bg-dark-border rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Tasks" value={stats.totalTasks} icon={<ListTodo />} iconColor="bg-blue-500" />
                <DashboardCard title="Completed" value={stats.completedTasks} icon={<CheckCircle />} iconColor="bg-green-500" />
                <DashboardCard title="Pending" value={stats.pendingTasks} icon={<Clock />} iconColor="bg-yellow-500" />
                <DashboardCard title="Approvals" value={stats.pendingApprovals} icon={<ClipboardCheck />} iconColor="bg-red-500" />
            </div>

            <div className="bg-dark-component rounded-lg p-6 border border-dark-border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-light">Recent Tasks</h3>
                    <Link to="/admin/tasks" className="text-sm font-semibold text-primary hover:underline">View All Tasks</Link>
                </div>
                <TaskTable tasks={recentTasks} users={users} renderActions={renderTaskActions} />
            </div>
        </div>
    );
};

export default AdminDashboard;