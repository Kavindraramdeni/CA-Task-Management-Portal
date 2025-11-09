import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Task, TaskStatus, TaskPriority } from '../../types';
import api from '../../services/mockApi';

const COLORS = {
    [TaskStatus.YET_TO_START]: '#8B949E',
    [TaskStatus.IN_PROGRESS]: '#2F81F7',
    [TaskStatus.COMPLETED]: '#34D399',
    [TaskStatus.PENDING_APPROVAL]: '#FBBF24',
    [TaskStatus.APPROVED]: '#A78BFA',
};

const Analytics: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        api.getTasks().then(data => {
            setTasks(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <p className="text-text-medium">Loading analytics...</p>;

    const statusData = Object.values(TaskStatus).map(status => ({
        name: status,
        value: tasks.filter(task => task.status === status).length,
    })).filter(item => item.value > 0);

    const priorityData = Object.values(TaskPriority).map(priority => ({
        name: priority,
        count: tasks.filter(task => task.priority === priority).length
    }));

    const employeeTaskDataMap = new Map<string, number>();
    tasks.forEach(task => {
        task.assignedTo.forEach(employeeId => {
            employeeTaskDataMap.set(employeeId, (employeeTaskDataMap.get(employeeId) || 0) + 1);
        });
    });
    const employeeTaskData = Array.from(employeeTaskDataMap, ([name, tasks]) => ({ name, tasks }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-dark-component p-2 border border-dark-border rounded-md shadow-lg">
                    <p className="label text-text-light">{`${label} : ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-dark-component p-6 rounded-lg border border-dark-border">
                <h3 className="text-lg font-semibold mb-4 text-text-light">Task Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                            {statusData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as TaskStatus]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={(value, entry) => <span className="text-text-medium">{value}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-dark-component p-6 rounded-lg border border-dark-border">
                <h3 className="text-lg font-semibold mb-4 text-text-light">Tasks per Employee</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={employeeTaskData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#8B949E' }} />
                        <YAxis tick={{ fill: '#8B949E' }} />
                        <Tooltip cursor={{fill: 'rgba(139, 148, 158, 0.1)'}} content={<CustomTooltip />} />
                        <Legend formatter={(value, entry) => <span className="text-text-medium">{value}</span>} />
                        <Bar dataKey="tasks" fill="#2F81F7" barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="bg-dark-component p-6 rounded-lg border border-dark-border lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-text-light">Tasks by Priority</h3>
                <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={priorityData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#8B949E' }} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#8B949E' }} />
                        <Tooltip cursor={{fill: 'rgba(139, 148, 158, 0.1)'}} content={<CustomTooltip />} />
                        <Legend formatter={(value, entry) => <span className="text-text-medium">{value}</span>} />
                        <Bar dataKey="count" barSize={40}>
                           <Cell fill="#F85149" />
                           <Cell fill="#FBBF24" />
                           <Cell fill="#34D399" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Analytics;