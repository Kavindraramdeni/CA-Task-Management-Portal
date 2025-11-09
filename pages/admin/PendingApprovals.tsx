import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Eye, History, Loader2 } from 'lucide-react';
import TaskTable from '../../components/TaskTable';
import { Task, Submission, TaskHistory, User, TaskStatus } from '../../types';
import api from '../../services/mockApi';
import ViewSubmissionModal from '../../components/ViewSubmissionModal';
import TaskHistoryModal from '../../components/TaskHistoryModal';
import RejectionModal from '../../components/RejectionModal';

const PendingApprovals: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

    // State for rejection modal
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [tasksToReject, setTasksToReject] = useState<string[]>([]);

    // State for history modal
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);

    const fetchData = async () => {
        setLoading(true);
        const [data, usersData] = await Promise.all([
            api.getTasks(),
            api.getAllUsers()
        ]);
        setTasks(data);
        setUsers(usersData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const pendingTasks = useMemo(() => tasks.filter(t => t.status === TaskStatus.PENDING_APPROVAL), [tasks]);
    const completedTasks = useMemo(() => tasks.filter(t => t.status === TaskStatus.APPROVED || t.status === TaskStatus.COMPLETED)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [tasks]);

    const handleTaskSelect = (taskId: string) => {
        setSelectedTasks(prev => 
            prev.includes(taskId) 
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    const handleSelectAllTasks = () => {
        if (selectedTasks.length === pendingTasks.length) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(pendingTasks.map(t => t._id));
        }
    };
    
    const handleBulkApprove = async () => {
        if (!window.confirm(`Are you sure you want to approve ${selectedTasks.length} selected tasks?`)) return;

        setIsProcessing(true);
        await api.approveTasks(selectedTasks);
        await fetchData();
        setSelectedTasks([]);
        setIsProcessing(false);
    };

    const handleOpenRejectionModal = (taskIds: string[]) => {
        setTasksToReject(taskIds);
        setIsRejectionModalOpen(true);
    };

    const handleConfirmRejection = async (remarks: string) => {
        setIsProcessing(true);
        setIsRejectionModalOpen(false);
        if (tasksToReject.length === 1) {
            await api.rejectTask(tasksToReject[0], remarks);
        } else {
            await api.rejectTasks(tasksToReject, remarks);
        }
        await fetchData();
        setSelectedTasks([]);
        setTasksToReject([]);
        setIsProcessing(false);
        if (isViewModalOpen) setIsViewModalOpen(false);
    };


    const handleApprove = async (taskId: string) => {
        setIsProcessing(true);
        await api.approveTask(taskId);
        await fetchData();
        setIsProcessing(false);
        if (isViewModalOpen) {
            setIsViewModalOpen(false);
        }
    };

    const handleViewSubmission = async (task: Task) => {
        setSelectedTask(task);
        const submissions = await api.getSubmissionsForTask(task._id);
        if (submissions.length > 0) {
            setCurrentSubmission(submissions[submissions.length - 1]);
        } else {
            setCurrentSubmission({
                _id: '', taskId: task._id, employeeId: '', submittedFiles: [],
                remarks: 'No submission details found for this task.', status: 'Pending Approval', submittedAt: ''
            });
        }
        setIsViewModalOpen(true);
    };
    
    const handleViewHistory = async (task: Task) => {
        setSelectedTask(task);
        const historyData = await api.getTaskHistory(task._id);
        setTaskHistory(historyData);
        setIsHistoryModalOpen(true);
    };

    const renderApprovalActions = (task: Task) => (
        <div className="flex space-x-2 justify-end">
            <button onClick={() => handleViewHistory(task)} className="flex items-center bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm hover:bg-blue-500/30" title="View History"><History size={16} className="mr-1" /> History</button>
            <button onClick={() => handleViewSubmission(task)} className="flex items-center bg-secondary/20 text-blue-400 px-3 py-1 rounded-lg text-sm hover:bg-secondary/30" title="View Submission"><Eye size={16} className="mr-1" /> View</button>
            <button onClick={() => handleApprove(task._id)} className="flex items-center bg-success/20 text-green-400 px-3 py-1 rounded-lg text-sm hover:bg-success/30" title="Approve Task"><Check size={16} className="mr-1" /> Approve</button>
            <button onClick={() => handleOpenRejectionModal([task._id])} className="flex items-center bg-danger/20 text-red-400 px-3 py-1 rounded-lg text-sm hover:bg-danger/30" title="Reject Task"><X size={16} className="mr-1" /> Reject</button>
        </div>
    );
    
    const renderCompletedActions = (task: Task) => (
        <div className="flex space-x-2 justify-end">
            <button onClick={() => handleViewHistory(task)} className="flex items-center bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm hover:bg-blue-500/30" title="View History"><History size={16} className="mr-1" /> History</button>
            <button onClick={() => handleViewSubmission(task)} className="flex items-center bg-secondary/20 text-blue-400 px-3 py-1 rounded-lg text-sm hover:bg-secondary/30" title="View Submission"><Eye size={16} className="mr-1" /> View</button>
        </div>
    );

    return (
        <>
            <div className="space-y-8">
                <div className="bg-dark-component rounded-lg p-6 border border-dark-border">
                    <h3 className="text-xl font-bold text-text-light mb-6">Tasks Awaiting Approval</h3>

                    {selectedTasks.length > 0 && (
                         <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4 flex justify-between items-center">
                            <span className="text-primary font-semibold">{selectedTasks.length} task(s) selected</span>
                            <div className="space-x-2">
                                 <button onClick={handleBulkApprove} disabled={isProcessing} className="flex items-center bg-success/20 text-green-400 px-3 py-1 rounded-lg text-sm hover:bg-success/30 disabled:opacity-50">
                                    {isProcessing ? <Loader2 size={16} className="animate-spin mr-1" /> : <Check size={16} className="mr-1" />}
                                    Bulk Approve
                                </button>
                                <button onClick={() => handleOpenRejectionModal(selectedTasks)} disabled={isProcessing} className="flex items-center bg-danger/20 text-red-400 px-3 py-1 rounded-lg text-sm hover:bg-danger/30 disabled:opacity-50">
                                    {isProcessing ? <Loader2 size={16} className="animate-spin mr-1" /> : <X size={16} className="mr-1" />}
                                    Bulk Reject
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {loading ? (
                        <p className="text-text-medium">Loading approvals...</p>
                    ) : (
                        <TaskTable
                            tasks={pendingTasks}
                            users={users}
                            renderActions={renderApprovalActions}
                            selectable={true}
                            selectedTasks={selectedTasks}
                            onTaskSelect={handleTaskSelect}
                            onSelectAllTasks={handleSelectAllTasks}
                        />
                    )}
                </div>

                <div className="bg-dark-component rounded-lg p-6 border border-dark-border">
                     <h3 className="text-xl font-bold text-text-light mb-6">Completed & Approved Tasks</h3>
                      {loading ? (
                        <p className="text-text-medium">Loading completed tasks...</p>
                    ) : (
                        <TaskTable
                            tasks={completedTasks}
                            users={users}
                            renderActions={renderCompletedActions}
                        />
                    )}
                </div>
            </div>
            
            <ViewSubmissionModal
                isOpen={isViewModalOpen}
                isProcessing={isProcessing}
                onClose={() => setIsViewModalOpen(false)}
                onApprove={handleApprove}
                onReject={(taskId) => handleOpenRejectionModal([taskId])}
                task={selectedTask}
                submission={currentSubmission}
            />
             <RejectionModal
                isOpen={isRejectionModalOpen}
                isProcessing={isProcessing}
                onClose={() => setIsRejectionModalOpen(false)}
                onSubmit={handleConfirmRejection}
                taskCount={tasksToReject.length}
            />
            {selectedTask && (
                <TaskHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    taskName={selectedTask.clientName}
                    history={taskHistory}
                    users={users}
                />
            )}
        </>
    );
};

export default PendingApprovals;