
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/mockApi';
import { TimeEntry, Task } from '../../types';
import DashboardCard from '../../components/DashboardCard';

const getWeekDateRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return {
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0],
    };
};

const TimeEntryTable: React.FC<{ entries: TimeEntry[]; tasks: Task[] }> = ({ entries, tasks }) => {
    const getTaskName = (taskId: string) => tasks.find(t => t._id === taskId)?.clientName || 'Unknown Task';
    
    if (entries.length === 0) return <p className="text-center text-text-medium py-8">No time entries recorded yet.</p>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-border">
                <thead className="bg-dark-bg/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Task</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-text-medium uppercase tracking-wider">Hours</th>
                    </tr>
                </thead>
                <tbody className="bg-dark-component divide-y divide-dark-border">
                    {entries.map(entry => (
                        <tr key={entry._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{new Date(entry.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-medium">{getTaskName(entry.taskId)}</td>
                            <td className="px-6 py-4 text-sm text-text-light max-w-sm truncate" title={entry.description}>{entry.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-primary">{entry.hours.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const MyTimesheet: React.FC = () => {
    const { user } = useAuth();
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [userTasks, setUserTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [taskId, setTaskId] = useState('');
    const [hours, setHours] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const [entriesData, tasksData] = await Promise.all([
            api.getTimeEntries(user._id),
            api.getTasks().then(tasks => tasks.filter(t => t.assignedTo.includes(user._id)))
        ]);
        setTimeEntries(entriesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setUserTasks(tasksData);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskId || !hours || !user) return;
        setIsSubmitting(true);
        await api.createTimeEntry({
            userId: user._id,
            taskId,
            date,
            hours: parseFloat(hours),
            description,
        });
        setDate(new Date().toISOString().split('T')[0]);
        setTaskId('');
        setHours('');
        setDescription('');
        setIsSubmitting(false);
        await fetchData(); // Refresh data
    };

    const weekDateRange = getWeekDateRange();
    const weeklyHours = useMemo(() => {
        return timeEntries
            .filter(e => e.date >= weekDateRange.start && e.date <= weekDateRange.end)
            .reduce((sum, e) => sum + e.hours, 0);
    }, [timeEntries, weekDateRange]);

    const formInputClasses = "w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <DashboardCard title="Hours This Week" value={weeklyHours.toFixed(2)} icon={<Clock />} iconColor="bg-green-500" />
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-dark-component p-4 rounded-lg border border-dark-border">
                <div className="md:col-span-1">
                    <label className="text-xs text-text-medium">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={formInputClasses} />
                </div>
                <div className="md:col-span-1">
                    <label className="text-xs text-text-medium">Task</label>
                    <select value={taskId} onChange={e => setTaskId(e.target.value)} required className={formInputClasses}>
                        <option value="" disabled>Select Task</option>
                        {userTasks.map(t => <option key={t._id} value={t._id}>{t.clientName}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs text-text-medium">Description</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Work description" required className={formInputClasses} />
                </div>
                <div className="flex items-end gap-2">
                    <div className="flex-grow">
                        <label className="text-xs text-text-medium">Hours</label>
                        <input type="number" step="0.1" min="0.1" value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g., 2.5" required className={formInputClasses} />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="h-10 flex-shrink-0 flex items-center justify-center px-4 py-2 rounded-lg text-white bg-primary hover:bg-secondary disabled:bg-primary/50">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
                    </button>
                </div>
            </form>

            <div className="bg-dark-component rounded-lg p-6 border border-dark-border">
                <h3 className="text-xl font-bold text-text-light mb-4">My Time Entries</h3>
                {loading ? (
                    <p className="text-text-medium">Loading entries...</p>
                ) : (
                    <TimeEntryTable entries={timeEntries} tasks={userTasks} />
                )}
            </div>
        </div>
    );
};

export default MyTimesheet;
