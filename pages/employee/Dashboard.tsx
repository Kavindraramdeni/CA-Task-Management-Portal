
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import { Briefcase, Clock, CheckCircle, Upload, Megaphone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/mockApi';
import TaskTable from '../../components/TaskTable';
import { Task, Announcement, User } from '../../types';
import SubmissionModal from '../../components/SubmissionModal';

const SkeletonCard: React.FC = () => (
    <div className="bg-dark-component rounded-lg p-5 animate-pulse border border-dark-border">
        <div className="h-4 bg-dark-border rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-dark-border rounded w-1/2"></div>
    </div>
);


const EmployeeDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ assignedTasks: 0, myPendingTasks: 0, myCompletedTasks: 0 });
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const fetchData = async () => {
        if (user) {
            setLoading(true);
            const [statsData, tasksData, announcementsData, usersData] = await Promise.all([
                api.getDashboardStats(user._id, user.role),
                api.getTasks(),
                api.getAnnouncements(),
                api.getAllUsers()
            ]);
            setStats(statsData as any);
            const userTasks = tasksData.filter(t => t.assignedTo.includes(user._id));
            setRecentTasks(userTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
            setAnnouncements(announcementsData.slice(0, 3)); // Get latest 3
            setUsers(usersData);
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [user]);
    
    const handleOpenSubmissionModal = (task: Task) => {
        setSelectedTask(task);
        setSubmissionModalOpen(true);
    };

    const handleCloseSubmissionModal = () => {
        setSelectedTask(null);
        setSubmissionModalOpen(false);
    };

    const handleTaskSubmit = async (files: File[], remarks: string) => {
        if (selectedTask && user) {
            const fileNames = files.map(f => f.name);
            await api.submitTask({
                taskId: selectedTask._id,
                employeeId: user._id,
                submittedFiles: fileNames,
                remarks,
            });
            await fetchData(); // Refetch data for dashboard
        }
    };
    
    const renderTaskActions = (task: Task) => (
         <button onClick={() => handleOpenSubmissionModal(task)} className="flex items-center text-sm bg-primary/20 text-primary px-3 py-1 rounded-lg hover:bg-primary/30">
            <Upload size={14} className="mr-1" /> Submit Work
         </button>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                 <div className="bg-dark-component rounded-lg p-6 animate-pulse border border-dark-border">
                    <div className="h-6 bg-dark-border rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-10 bg-dark-border rounded"></div>
                        <div className="h-10 bg-dark-border rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard title="Assigned Tasks" value={stats.assignedTasks} icon={<Briefcase />} iconColor="bg-blue-500" />
                <DashboardCard title="Pending Tasks" value={stats.myPendingTasks} icon={<Clock />} iconColor="bg-yellow-500" />
                <DashboardCard title="Completed Tasks" value={stats.myCompletedTasks} icon={<CheckCircle />} iconColor="bg-green-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="bg-dark-component rounded-lg p-6 border border-dark-border xl:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-text-light">My Urgent Tasks</h3>
                        <Link to="/employee/my-tasks" className="text-sm font-semibold text-primary hover:underline">View All My Tasks</Link>
                    </div>
                    <TaskTable tasks={recentTasks} users={users} renderActions={renderTaskActions} />
                </div>
                 <div className="bg-dark-component rounded-lg p-6 border border-dark-border">
                    <h3 className="text-xl font-bold text-text-light mb-4 flex items-center">
                        <Megaphone size={20} className="mr-2 text-secondary" />
                        Latest Announcements
                    </h3>
                    <div className="space-y-3">
                        {announcements.length > 0 ? announcements.map(ann => (
                            <div key={ann._id} className="bg-dark-bg p-3 rounded-md border border-dark-border">
                                <h4 className="font-semibold text-text-light text-sm">{ann.title}</h4>
                                <p className="text-xs text-text-medium mt-1">{ann.content}</p>
                            </div>
                        )) : (
                            <p className="text-sm text-text-medium text-center py-4">No new announcements.</p>
                        )}
                    </div>
                </div>
            </div>
            
            {selectedTask && (
                <SubmissionModal
                    isOpen={submissionModalOpen}
                    onClose={handleCloseSubmissionModal}
                    onSubmit={handleTaskSubmit}
                    taskName={selectedTask.clientName}
                />
            )}
        </div>
    );
};

export default EmployeeDashboard;
