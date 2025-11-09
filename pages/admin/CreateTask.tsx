import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, TaskPriority, TaskStatus, Team } from '../../types';
import api from '../../services/mockApi';
import { Loader2, Plus, X } from 'lucide-react';

const CreateTask: React.FC = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<User[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [clientName, setClientName] = useState('');
    const [clientGroup, setClientGroup] = useState('');
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
    const [dueDate, setDueDate] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [description, setDescription] = useState('');
    const [workType, setWorkType] = useState('');

    // Assignment state
    const [assignmentType, setAssignmentType] = useState<'employees' | 'teams'>('employees');
    const [assignedEmployees, setAssignedEmployees] = useState<string[]>([]);
    const [assignedTeams, setAssignedTeams] = useState<string[]>([]);


    useEffect(() => {
        api.getUsers().then(setEmployees);
        api.getTeams().then(setTeams);
    }, []);
    
    const handleAssignEmployee = (employeeId: string) => {
        if (employeeId && !assignedEmployees.includes(employeeId)) {
            setAssignedEmployees([...assignedEmployees, employeeId]);
        }
    };
    
    const handleRemoveEmployee = (employeeId: string) => {
        setAssignedEmployees(assignedEmployees.filter(id => id !== employeeId));
    };

    const handleAssignTeam = (teamId: string) => {
        if (teamId && !assignedTeams.includes(teamId)) {
            setAssignedTeams([...assignedTeams, teamId]);
        }
    };

    const handleRemoveTeam = (teamId: string) => {
        setAssignedTeams(assignedTeams.filter(id => id !== teamId));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalAssignedTo: string[] = [];
        if (assignmentType === 'employees') {
            finalAssignedTo = assignedEmployees;
        } else {
            const memberIds = new Set<string>();
            assignedTeams.forEach(teamId => {
                const team = teams.find(t => t._id === teamId);
                if (team) {
                    team.members.forEach(memberId => memberIds.add(memberId));
                }
            });
            finalAssignedTo = Array.from(memberIds);
        }

        if (!clientName || !dueDate || !targetDate || finalAssignedTo.length === 0) {
            setError('Please fill all required fields and assign the task to at least one employee or team.');
            return;
        }
        setError('');
        setLoading(true);

        const newTaskData = {
            clientName,
            clientGroup,
            priority,
            inwardDate: new Date().toISOString(),
            dueDate,
            targetDate,
            internalWork: false, // Assuming for now
            assignedTo: finalAssignedTo,
            assignedTeams: assignmentType === 'teams' ? assignedTeams : [],
            guides: [], // Assuming for now
            status: TaskStatus.YET_TO_START,
            description,
            workType: workType.split(',').map(s => s.trim()).filter(Boolean),
            attachments: [],
        };

        try {
            await api.createTask(newTaskData);
            navigate('/admin/tasks');
        } catch (err) {
            setError('Failed to create task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formInputClasses = "w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none focus:ring-2 focus:ring-primary";

    const availableEmployees = employees.filter(emp => !assignedEmployees.includes(emp._id));
    const availableTeams = teams.filter(team => !assignedTeams.includes(team._id));

    return (
        <div className="bg-dark-component p-8 rounded-lg border border-dark-border max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-text-light mb-6">Create New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="clientName" className="block text-sm font-medium text-text-medium mb-1">Client Name</label>
                        <input type="text" id="clientName" value={clientName} onChange={e => setClientName(e.target.value)} required className={formInputClasses} />
                    </div>
                    <div>
                        <label htmlFor="clientGroup" className="block text-sm font-medium text-text-medium mb-1">Client Group</label>
                        <input type="text" id="clientGroup" value={clientGroup} onChange={e => setClientGroup(e.target.value)} className={formInputClasses} />
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-text-medium mb-1">Priority</label>
                        <select id="priority" value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className={formInputClasses}>
                            {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="workType" className="block text-sm font-medium text-text-medium mb-1">Work Type (comma-separated)</label>
                        <input type="text" id="workType" value={workType} onChange={e => setWorkType(e.target.value)} className={formInputClasses} placeholder="e.g., GST, Audit" />
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-text-medium mb-1">Due Date</label>
                        <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} required className={formInputClasses} />
                    </div>
                    <div>
                        <label htmlFor="targetDate" className="block text-sm font-medium text-text-medium mb-1">Target Date</label>
                        <input type="date" id="targetDate" value={targetDate} onChange={e => setTargetDate(e.target.value)} required className={formInputClasses} />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text-medium mb-1">Description (Optional)</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className={formInputClasses} />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-medium mb-2">Assign To</label>
                    <div className="flex items-center space-x-4 mb-3">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="assignmentType" value="employees" checked={assignmentType === 'employees'} onChange={() => setAssignmentType('employees')} className="form-radio bg-dark-bg border-dark-border text-primary focus:ring-primary" />
                            <span className="ml-2 text-text-light">Individual Employees</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="assignmentType" value="teams" checked={assignmentType === 'teams'} onChange={() => setAssignmentType('teams')} className="form-radio bg-dark-bg border-dark-border text-primary focus:ring-primary" />
                            <span className="ml-2 text-text-light">Teams</span>
                        </label>
                    </div>

                    {assignmentType === 'employees' && (
                        <div className="bg-dark-bg p-2 rounded-lg border border-dark-border">
                            <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] items-center">
                                {assignedEmployees.map(id => {
                                    const user = employees.find(e => e._id === id);
                                    return (
                                        <span key={id} className="flex items-center bg-primary/20 text-primary px-2 py-1 rounded-full text-sm">
                                            {user?.name || id}
                                            <button type="button" onClick={() => handleRemoveEmployee(id)} className="ml-2 text-primary/70 hover:text-primary focus:outline-none">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                            <select onChange={e => handleAssignEmployee(e.target.value)} value="" className={formInputClasses}>
                                <option value="" disabled>-- Select an employee to assign --</option>
                                {availableEmployees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {assignmentType === 'teams' && (
                         <div className="bg-dark-bg p-2 rounded-lg border border-dark-border">
                            <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] items-center">
                                {assignedTeams.map(id => {
                                    const team = teams.find(t => t._id === id);
                                    return (
                                        <span key={id} className="flex items-center bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-sm">
                                            {team?.name || id}
                                            <button type="button" onClick={() => handleRemoveTeam(id)} className="ml-2 text-purple-400/70 hover:text-purple-400 focus:outline-none">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                            <select onChange={e => handleAssignTeam(e.target.value)} value="" className={formInputClasses}>
                                <option value="" disabled>-- Select a team to assign --</option>
                                {availableTeams.map(team => (
                                    <option key={team._id} value={team._id}>{team.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {error && <p className="text-sm text-danger">{error}</p>}

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/admin/tasks')} className="px-6 py-2 rounded-lg text-text-light bg-dark-border/50 hover:bg-dark-border transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex items-center justify-center px-6 py-2 rounded-lg text-white bg-primary hover:bg-secondary disabled:bg-primary/50 transition-colors">
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Plus className="mr-2" size={20} />}
                        Create Task
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTask;