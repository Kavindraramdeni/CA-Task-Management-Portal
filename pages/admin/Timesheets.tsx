
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, PlusCircle, Loader2, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/mockApi';
import { TimeEntry, Task, User, Role } from '../../types';
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

const TimesheetForm: React.FC<{ tasks: Task[]; userId: string; onEntryAdded: () => void }> = ({ tasks, userId, onEntryAdded }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [taskId, setTaskId] = useState('');
    const [hours, setHours] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskId || !hours) return;
        setIsSubmitting(true);
        await api.createTimeEntry({
            userId,
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
        onEntryAdded();
    };
    
    const formInputClasses = "w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-dark-component p-4 rounded-lg border border-dark-border">
            <div className="md:col-span-1">
                <label className="text-xs text-text-medium">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={formInputClasses} />
            </div>
            <div className="md:col-span-1">
                <label className="text-xs text-text-medium">Task</label>
                <select value={taskId} onChange={e => setTaskId(e.target.value)} required className={formInputClasses}>
                    <option value="" disabled>Select Task</option>
                    {tasks.map(t => <option key={t._id} value={t._id}>{t.clientName}</option>)}
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
    );
};

const TimeEntryTable: React.FC<{ entries: TimeEntry[]; tasks: Task[]; users: User[], showUser?: boolean }> = ({ entries, tasks, users, showUser = false }) => {
    const getTaskName = (taskId: string) => tasks.find(t => t._id === taskId)?.clientName || 'Unknown Task';
    const getUserName = (userId: string) => users.find(u => u._id === userId)?.name || 'Unknown User';
    
    if (entries.length === 0) return <p className="text-center text-text-medium py-8">No time entries found for the selected period.</p>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-border">
                <thead className="bg-dark-bg/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Date</th>
                        {showUser && <th className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Employee</th>}
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Task</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-text-medium uppercase tracking-wider">Hours</th>
                    </tr>
                </thead>
                <tbody className="bg-dark-component divide-y divide-dark-border">
                    {entries.map(entry => (
                        <tr key={entry._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{new Date(entry.date).toLocaleDateString()}</td>
                             {showUser && <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{getUserName(entry.userId)}</td>}
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


const AdminTimesheets: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'personal' | 'subordinates'>('personal');
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters for subordinates tab
    const [selectedUser, setSelectedUser] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const [tasksData, usersData] = await Promise.all([
            api.getTasks(),
            api.getAllUsers(),
        ]);
        setAllTasks(tasksData);
        setAllUsers(usersData);
        
        let entriesData: TimeEntry[];
        if(activeTab === 'personal') {
            entriesData = await api.getTimeEntries(user._id);
        } else {
            entriesData = await api.getTimeEntries();
        }
        
        setTimeEntries(entriesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setLoading(false);
    }, [user, activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const userTasks = useMemo(() => allTasks.filter(t => t.assignedTo.includes(user?._id || '')), [allTasks, user]);

    const weekDateRange = getWeekDateRange();
    const personalWeeklyHours = useMemo(() => {
        return timeEntries
            .filter(e => e.userId === user?._id && e.date >= weekDateRange.start && e.date <= weekDateRange.end)
            .reduce((sum, e) => sum + e.hours, 0);
    }, [timeEntries, user, weekDateRange]);

    const filteredSubordinateEntries = useMemo(() => {
        return timeEntries.filter(entry => {
            const userMatch = selectedUser === 'all' || entry.userId === selectedUser;
            const startDateMatch = !dateRange.start || entry.date >= dateRange.start;
            const endDateMatch = !dateRange.end || entry.date <= dateRange.end;
            return userMatch && startDateMatch && endDateMatch;
        });
    }, [timeEntries, selectedUser, dateRange]);

    return (
        <div className="space-y-6">
            <div className="border-b border-dark-border">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('personal')} className={`${activeTab === 'personal' ? 'border-primary text-primary' : 'border-transparent text-text-medium hover:text-text-light'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}>My Timesheet</button>
                    <button onClick={() => setActiveTab('subordinates')} className={`${activeTab === 'subordinates' ? 'border-primary text-primary' : 'border-transparent text-text-medium hover:text-text-light'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}>Subordinate Timesheets</button>
                </nav>
            </div>
            
            {loading && <p className="text-text-medium">Loading timesheets...</p>}

            {!loading && activeTab === 'personal' && user && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DashboardCard title="Hours This Week" value={personalWeeklyHours.toFixed(2)} icon={<Clock />} iconColor="bg-purple-500" />
                    </div>
                    <TimesheetForm tasks={userTasks} userId={user._id} onEntryAdded={fetchData} />
                    <div className="bg-dark-component rounded-lg p-6 border border-dark-border">
                        <TimeEntryTable entries={timeEntries.filter(e => e.userId === user._id)} tasks={allTasks} users={allUsers} />
                    </div>
                </div>
            )}

            {!loading && activeTab === 'subordinates' && (
                <div className="space-y-6">
                    <div className="bg-dark-component p-4 rounded-lg border border-dark-border grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none">
                            <option value="all">All Employees</option>
                            {allUsers.filter(u => u.role === Role.EMPLOYEE).map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                        </select>
                        <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none" />
                        <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none" />
                    </div>
                    <div className="bg-dark-component rounded-lg p-6 border border-dark-border">
                        <TimeEntryTable entries={filteredSubordinateEntries} tasks={allTasks} users={allUsers} showUser />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTimesheets;
