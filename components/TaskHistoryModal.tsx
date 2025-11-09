import React from 'react';
import { X, History, MessageSquare } from 'lucide-react';
import { TaskHistory, TaskStatus, User } from '../types';

interface TaskHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskName: string;
    history: TaskHistory[];
    users: User[];
}

const statusColors: { [key in TaskStatus]: string } = {
    [TaskStatus.YET_TO_START]: 'bg-gray-700 text-gray-300',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-900 text-blue-300',
    [TaskStatus.COMPLETED]: 'bg-green-900 text-green-300',
    [TaskStatus.PENDING_APPROVAL]: 'bg-yellow-800 text-yellow-300',
    [TaskStatus.APPROVED]: 'bg-purple-900 text-purple-300',
};

const TaskHistoryModal: React.FC<TaskHistoryModalProps> = ({ isOpen, onClose, taskName, history, users }) => {
    if (!isOpen) return null;

    const getUserName = (userId: string) => users.find(u => u._id === userId)?.name || 'System';

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-dark-component rounded-lg shadow-xl w-full max-w-2xl border border-dark-border transform transition-all">
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h3 className="text-lg font-semibold text-text-light">History for: <span className="text-primary">{taskName}</span></h3>
                    <button onClick={onClose} className="text-text-medium hover:text-text-light p-1 rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {history.length > 0 ? (
                        <ul className="space-y-4">
                            {history.map(entry => (
                                <li key={entry._id} className="flex items-start space-x-4">
                                    <div className="bg-dark-border p-2 rounded-full mt-1">
                                        <History size={16} className="text-text-medium" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-text-light">
                                            Status changed to <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[entry.newStatus]}`}>{entry.newStatus}</span>
                                            {entry.remarks && <span className="ml-2 text-xs font-semibold text-danger/80">(Feedback Provided)</span>}
                                        </p>
                                        <p className="text-xs text-text-medium">
                                            by <span className="font-semibold text-text-light">{getUserName(entry.changedBy)}</span> on {new Date(entry.timestamp).toLocaleString()}
                                        </p>
                                        {entry.remarks && (
                                            <div className="mt-2 bg-dark-bg p-3 rounded-md border-l-4 border-danger/50">
                                                <p className="text-sm font-semibold text-red-400 flex items-center">
                                                    <MessageSquare size={14} className="mr-2" />
                                                    Rejection Feedback:
                                                </p>
                                                <p className="text-sm text-text-medium italic mt-1">
                                                    "{entry.remarks}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-text-medium py-8">No history found for this task.</p>
                    )}
                </div>
                 <div className="bg-dark-bg/50 px-6 py-3 flex justify-end items-center rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-text-light bg-dark-border/50 hover:bg-dark-border transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskHistoryModal;