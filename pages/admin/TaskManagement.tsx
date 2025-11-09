import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Edit, Trash2, History } from 'lucide-react';
import TaskTable from '../../components/TaskTable';
import { Task, TaskStatus, TaskPriority, User, TaskHistory } from '../../types';
import api from '../../services/mockApi';
import TaskHistoryModal from '../../components/TaskHistoryModal';

const TaskManagement: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');

    // State for history modal
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedTaskForHistory, setSelectedTaskForHistory] = useState<Task | null>(null);
    const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [tasksData, usersData] = await Promise.all([
            api.getTasks(),
            api.getAllUsers()
        ]);
        setTasks(tasksData);
        setUsers(usersData);
        setLoading(false);
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleViewHistory = async (task: Task) => {
        setSelectedTaskForHistory(task);
        const historyData = await api.getTaskHistory(task._id);
        setTaskHistory(historyData);
        setIsHistoryModalOpen(true);
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.clientName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, searchTerm, statusFilter, priorityFilter]);
    
    const renderTaskActions = (task: Task) => (
        <div className="flex space-x-2">
            <button onClick={() => handleViewHistory(task)} className="p-1 text-blue-400 hover:text-blue-300" title="View History"><History size={16} /></button>
            <Link to={`/admin/edit-task/${task._id}`} className="p-1 text-secondary hover:text-primary" title="Edit Task"><Edit size={16} /></Link>
        </div>
    );

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-text-light">Task Management</h3>
                    <Link
                        to="/admin/create-task"
                        className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors shadow-md hover:shadow-lg"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        Create New Task
                    </Link>
                </div>
            
                <div className="bg-dark-component rounded-lg p-4 border border-dark-border">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-medium" size={20} />
                            <input
                                type="text"
                                placeholder="Search by client name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-dark-bg rounded-lg pl-10 pr-4 py-2 border border-dark-border text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter} className="w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="All">All Statuses</option>
                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                         <select onChange={(e) => setPriorityFilter(e.target.value)} value={priorityFilter} className="w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="All">All Priorities</option>
                            {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-dark-component rounded-lg p-6 border border-dark-border">
                    {loading ? (
                        <div className="text-center text-text-medium">Loading tasks...</div>
                    ) : (
                        <TaskTable tasks={filteredTasks} users={users} renderActions={renderTaskActions} />
                    )}
                </div>
            </div>
            {selectedTaskForHistory && (
                <TaskHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    taskName={selectedTaskForHistory.clientName}
                    history={taskHistory}
                    users={users}
                />
            )}
        </>
    );
};

export default TaskManagement;