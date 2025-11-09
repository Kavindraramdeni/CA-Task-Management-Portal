
import React, { useEffect, useState } from 'react';
import TaskTable from '../../components/TaskTable';
import { Task, TaskStatus, User, TaskHistory, Submission } from '../../types';
import api from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { Upload, Eye, History } from 'lucide-react';
import SubmissionModal from '../../components/SubmissionModal';
import TaskHistoryModal from '../../components/TaskHistoryModal';
import ViewSubmissionModal from '../../components/ViewSubmissionModal';

const MyTasks: React.FC = () => {
    const { user } = useAuth();
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    
    // State for submission modal
    const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // State for viewing submission
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);


    // State for history modal
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);

    const fetchTasks = async () => {
        if (user) {
            setLoading(true);
            const [tasksData, usersData] = await Promise.all([
                api.getTasks(),
                api.getAllUsers()
            ]);
            setAllTasks(tasksData.filter(t => t.assignedTo.includes(user._id)));
            setUsers(usersData);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
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
                remarks: remarks,
            });
            await fetchTasks();
        }
    };
    
    const handleViewHistory = async (task: Task) => {
        setSelectedTask(task);
        const historyData = await api.getTaskHistory(task._id);
        setTaskHistory(historyData);
        setIsHistoryModalOpen(true);
    };

    const handleViewSubmission = async (task: Task) => {
        setSelectedTask(task);
        const submissions = await api.getSubmissionsForTask(task._id);
        if (submissions.length > 0) {
            // Get the most recent submission
            const latestSubmission = submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
            setCurrentSubmission(latestSubmission);
        } else {
            setCurrentSubmission(null); // Should not happen for a submitted task, but handle it
        }
        setIsViewModalOpen(true);
    };


    const pendingTasks = allTasks.filter(t => t.status === TaskStatus.YET_TO_START || t.status === TaskStatus.IN_PROGRESS);
    const completedTasks = allTasks.filter(t => ![TaskStatus.YET_TO_START, TaskStatus.IN_PROGRESS].includes(t.status));

    const displayedTasks = activeTab === 'pending' ? pendingTasks : completedTasks;

    const renderTaskActions = (task: Task) => {
        return (
            <div className="flex space-x-2 justify-end">
                <button onClick={() => handleViewHistory(task)} className="flex items-center text-sm bg-dark-border/50 text-text-medium px-3 py-1 rounded-lg hover:bg-dark-border">
                    <History size={14} className="mr-1" /> History
                </button>
                {activeTab === 'pending' ? (
                    <button onClick={() => handleOpenSubmissionModal(task)} className="flex items-center text-sm bg-primary/20 text-primary px-3 py-1 rounded-lg hover:bg-primary/30">
                        <Upload size={14} className="mr-1" /> Submit Work
                    </button>
                ) : (
                    <button onClick={() => handleViewSubmission(task)} className="flex items-center text-sm bg-dark-border/50 text-text-medium px-3 py-1 rounded-lg hover:bg-dark-border">
                        <Eye size={14} className="mr-1" /> View Submission
                    </button>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="bg-dark-component rounded-lg p-6 border border-dark-border">
                <div className="border-b border-dark-border mb-4">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`${
                                activeTab === 'pending'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-medium hover:text-text-light hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                        >
                            Pending Tasks ({pendingTasks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`${
                                activeTab === 'completed'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-medium hover:text-text-light hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                        >
                            Completed & Submitted ({completedTasks.length})
                        </button>
                    </nav>
                </div>
                {loading ? (
                    <p className="text-text-medium">Loading tasks...</p>
                ) : (
                    <TaskTable tasks={displayedTasks} users={users} renderActions={renderTaskActions} />
                )}
            </div>
            {selectedTask && (
                <SubmissionModal
                    isOpen={submissionModalOpen}
                    onClose={handleCloseSubmissionModal}
                    onSubmit={handleTaskSubmit}
                    taskName={selectedTask.clientName}
                />
            )}
             {selectedTask && (
                <TaskHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    taskName={selectedTask.clientName}
                    history={taskHistory}
                    users={users}
                />
            )}
             {selectedTask && currentSubmission && (
                <ViewSubmissionModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    task={selectedTask}
                    submission={currentSubmission}
                />
            )}
        </>
    );
};

export default MyTasks;
