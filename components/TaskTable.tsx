import React from 'react';
import { Task, TaskStatus, TaskPriority, User } from '../types';

interface TaskTableProps {
    tasks: Task[];
    users: User[];
    renderActions?: (task: Task) => React.ReactNode;
    selectable?: boolean;
    selectedTasks?: string[];
    onTaskSelect?: (taskId: string) => void;
    onSelectAllTasks?: () => void;
}

const statusColors: { [key in TaskStatus]: string } = {
    [TaskStatus.YET_TO_START]: 'bg-gray-700 text-gray-300',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-900 text-blue-300',
    [TaskStatus.COMPLETED]: 'bg-green-900 text-green-300',
    [TaskStatus.PENDING_APPROVAL]: 'bg-yellow-800 text-yellow-300',
    [TaskStatus.APPROVED]: 'bg-purple-900 text-purple-300',
};

const priorityColors: { [key in TaskPriority]: { dot: string, text: string } } = {
    [TaskPriority.HIGH]: { dot: 'bg-red-500', text: 'text-red-400' },
    [TaskPriority.MEDIUM]: { dot: 'bg-yellow-500', text: 'text-yellow-400' },
    [TaskPriority.LOW]: { dot: 'bg-green-500', text: 'text-green-400' },
};

const userColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};
const getColorForId = (id: string) => userColors[parseInt(id.replace('u', '')) % userColors.length];

const TaskTable: React.FC<TaskTableProps> = ({ 
    tasks, 
    users,
    renderActions, 
    selectable = false, 
    selectedTasks = [], 
    onTaskSelect, 
    onSelectAllTasks 
}) => {
    if (tasks.length === 0) {
        return <p className="text-center text-text-medium py-8">No tasks match the current filters.</p>;
    }

    const isAllSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
    const getUserById = (id: string) => users.find(u => u._id === id);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-border">
                <thead className="bg-dark-bg/50">
                    <tr>
                        {selectable && (
                            <th scope="col" className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    className="bg-dark-bg border-dark-border text-primary focus:ring-primary rounded"
                                    checked={isAllSelected}
                                    onChange={onSelectAllTasks}
                                    aria-label="Select all tasks"
                                />
                            </th>
                        )}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Client / Task</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Priority</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Due Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Assigned To</th>
                        {renderActions && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-medium uppercase tracking-wider">Actions</th>}
                    </tr>
                </thead>
                <tbody className="bg-dark-component divide-y divide-dark-border">
                    {tasks.map((task) => (
                        <tr key={task._id} className={`hover:bg-white/5 ${selectedTasks.includes(task._id) ? 'bg-primary/10' : ''}`}>
                            {selectable && onTaskSelect && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        className="bg-dark-bg border-dark-border text-primary focus:ring-primary rounded"
                                        checked={selectedTasks.includes(task._id)}
                                        onChange={() => onTaskSelect(task._id)}
                                        aria-label={`Select task ${task.clientName}`}
                                    />
                                </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-light">
                                <div className="font-bold">{task.clientName}</div>
                                <div className="text-xs text-text-medium">{task.description.substring(0, 40)}...</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center">
                                    <span className={`h-2 w-2 rounded-full mr-2 ${priorityColors[task.priority].dot}`}></span>
                                    <span className={priorityColors[task.priority].text}>{task.priority}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-medium">{new Date(task.dueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[task.status]}`}>
                                    {task.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-medium">
                                <div className="flex -space-x-2">
                                    {task.assignedTo.map(userId => {
                                        const user = getUserById(userId);
                                        return (
                                            <div key={userId} title={user?.name || 'Unknown User'} className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-dark-component ${getColorForId(userId)}`}>
                                                {user ? getInitials(user.name) : '??'}
                                            </div>
                                        );
                                    })}
                                </div>
                            </td>
                            {renderActions && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {renderActions(task)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TaskTable;