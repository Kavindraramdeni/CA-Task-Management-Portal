
import { User, Role, Task, TaskPriority, TaskStatus, Submission, Team, Announcement, TimeEntry, TaskHistory } from '../types';

// --- DATABASE STRUCTURE AND HELPERS ---

interface MockDb {
    users: User[];
    tasks: Task[];
    submissions: Submission[];
    teams: Team[];
    announcements: Announcement[];
    timeEntries: TimeEntry[];
    taskHistory: TaskHistory[];
}

const DB_KEY = 'ca_portal_db';

// --- INITIAL MOCK DATA (Used only if localStorage is empty) ---
const getInitialDb = (): MockDb => ({
    users: [
        { _id: 'u001', name: 'Admin User', email: 'admin@firm.com', role: Role.ADMIN, team: 'Management', createdAt: new Date().toISOString() },
        { _id: 'u002', name: 'Sravan', email: 'sravan@firm.com', role: Role.EMPLOYEE, team: 'Audit Team', createdAt: new Date().toISOString() },
        { _id: 'u003', name: 'Ajay', email: 'ajay@firm.com', role: Role.EMPLOYEE, team: 'Tax Team', createdAt: new Date().toISOString() },
        { _id: 'u004', name: 'Sai', email: 'sai@firm.com', role: Role.EMPLOYEE, team: 'Audit Team', createdAt: new Date().toISOString() },
        { _id: 'u005', name: 'Abdul', email: 'abdul@firm.com', role: Role.EMPLOYEE, team: 'Audit Team', createdAt: new Date().toISOString() },
        { _id: 'u006', name: 'Sreeja', email: 'sreeja@firm.com', role: Role.EMPLOYEE, team: 'Tax Team', createdAt: new Date().toISOString() },
    ],
    tasks: [
        {
            _id: 't001', clientName: 'ABC Pvt Ltd', clientGroup: 'Corporate', priority: TaskPriority.HIGH, inwardDate: '2025-11-08T10:30:00Z',
            dueDate: '2025-11-12', targetDate: '2025-11-11', internalWork: false, assignedTo: ['u002', 'u004'], assignedTeams: [], teamHead: 'u001',
            guides: ['g001'], status: TaskStatus.IN_PROGRESS, description: 'Prepare GST filing for Q3', workType: ['GST', 'Audit'],
            attachments: [], createdBy: 'u001', createdAt: '2025-11-08T12:00:00Z'
        },
        {
            _id: 't002', clientName: 'XYZ Corp', clientGroup: 'Corporate', priority: TaskPriority.MEDIUM, inwardDate: '2025-11-09T09:00:00Z',
            dueDate: '2025-11-20', targetDate: '2025-11-18', internalWork: false, assignedTo: ['u003'], assignedTeams: [], teamHead: 'u001',
            guides: [], status: TaskStatus.YET_TO_START, description: 'Annual tax audit for FY 2024-25', workType: ['Tax', 'Audit'],
            attachments: [], createdBy: 'u001', createdAt: '2025-11-09T10:00:00Z'
        },
        {
            _id: 't003', clientName: 'Internal Meeting', clientGroup: 'Internal', priority: TaskPriority.LOW, inwardDate: '2025-11-10T14:00:00Z',
            dueDate: '2025-11-10', targetDate: '2025-11-10', internalWork: true, assignedTo: ['u002', 'u003', 'u004'], assignedTeams: [], teamHead: 'u001',
            guides: [], status: TaskStatus.COMPLETED, description: 'Team performance review meeting', workType: ['Internal'],
            attachments: [], createdBy: 'u001', createdAt: '2025-11-10T11:00:00Z'
        },
        {
            _id: 't004', clientName: 'Innovate LLC', clientGroup: 'Startup', priority: TaskPriority.HIGH, inwardDate: '2025-11-11T11:00:00Z',
            dueDate: '2025-11-15', targetDate: '2025-11-14', internalWork: false, assignedTo: ['u002'], assignedTeams: [], teamHead: 'u001',
            guides: [], status: TaskStatus.PENDING_APPROVAL, description: 'Finalize investment deck financials.', workType: ['Consulting'],
            attachments: [], createdBy: 'u001', createdAt: '2025-11-11T12:00:00Z'
        },
        {
            _id: 't005', clientName: 'Team Task Inc', clientGroup: 'Corporate', priority: TaskPriority.MEDIUM, inwardDate: '2025-11-12T09:00:00Z',
            dueDate: '2025-11-22', targetDate: '2025-11-20', internalWork: false, assignedTo: ['u002', 'u004'], assignedTeams: ['team01'], teamHead: 'u001',
            guides: [], status: TaskStatus.YET_TO_START, description: 'Group audit planning session', workType: ['Audit', 'Planning'],
            attachments: [], createdBy: 'u001', createdAt: '2025-11-12T10:00:00Z'
        },
    ],
    submissions: [
        { _id: 's001', taskId: 't004', employeeId: 'u002', submittedFiles: ['financials_v3.xlsx'], remarks: 'Completed financials.', status: 'Pending Approval', submittedAt: new Date().toISOString() }
    ],
    teams: [
        { _id: 'team01', name: 'Audit Superstars', members: ['u002', 'u004'] },
        { _id: 'team02', name: 'Tax Wizards', members: ['u003'] },
    ],
    announcements: [
        { _id: 'ann01', title: 'Upcoming Holiday', content: 'The office will be closed this Friday for a national holiday.', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { _id: 'ann02', title: 'New Coffee Machine!', content: 'Enjoy the new espresso machine in the break room. Please keep it clean!', createdAt: new Date().toISOString() },
    ],
    timeEntries: [
        { _id: 'te001', userId: 'u002', taskId: 't001', date: new Date().toISOString().split('T')[0], hours: 4.5, description: 'Drafted initial GST report.', createdAt: new Date().toISOString() },
        { _id: 'te002', userId: 'u003', taskId: 't002', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], hours: 8, description: 'Client meeting and data collection.', createdAt: new Date().toISOString() },
        { _id: 'te003', userId: 'u002', taskId: 't001', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], hours: 3, description: 'Follow-up queries on transactions.', createdAt: new Date().toISOString() },
        { _id: 'te004', userId: 'u001', taskId: 't003', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], hours: 1.5, description: 'Conducted team performance review.', createdAt: new Date().toISOString() },
    ],
    taskHistory: [
        { _id: 'th001', taskId: 't001', newStatus: TaskStatus.YET_TO_START, changedBy: 'u001', timestamp: '2025-11-08T12:00:00Z' },
        { _id: 'th002', taskId: 't001', newStatus: TaskStatus.IN_PROGRESS, changedBy: 'u002', timestamp: '2025-11-08T14:00:00Z' },
        { _id: 'th003', taskId: 't002', newStatus: TaskStatus.YET_TO_START, changedBy: 'u001', timestamp: '2025-11-09T10:00:00Z' },
        { _id: 'th004', taskId: 't003', newStatus: TaskStatus.YET_TO_START, changedBy: 'u001', timestamp: '2025-11-10T11:00:00Z' },
        { _id: 'th005', taskId: 't003', newStatus: TaskStatus.COMPLETED, changedBy: 'u003', timestamp: '2025-11-10T18:00:00Z' },
        { _id: 'th006', taskId: 't004', newStatus: TaskStatus.IN_PROGRESS, changedBy: 'u002', timestamp: '2025-11-11T13:00:00Z' },
        { _id: 'th007', taskId: 't004', newStatus: TaskStatus.PENDING_APPROVAL, changedBy: 'u002', timestamp: new Date().toISOString() },
        { _id: 'th008', taskId: 't005', newStatus: TaskStatus.YET_TO_START, changedBy: 'u001', timestamp: '2025-11-12T10:00:00Z' },
    ]
});

const loadDb = (): MockDb => {
    try {
        const storedDb = localStorage.getItem(DB_KEY);
        if (storedDb) {
            return JSON.parse(storedDb);
        }
    } catch (error) {
        console.error('Error parsing DB from localStorage', error);
    }
    // A one-time reset if the model changes significantly
    // localStorage.removeItem(DB_KEY);
    return getInitialDb();
};

const saveDb = (db: MockDb) => {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (error) {
        console.error('Error setting DB in localStorage', error);
    }
};

let db = loadDb();

const addHistoryRecord = (taskId: string, newStatus: TaskStatus, changedBy: string, remarks?: string) => {
    const newRecord: TaskHistory = {
        _id: `th${Date.now()}${Math.random()}`,
        taskId,
        newStatus,
        changedBy,
        timestamp: new Date().toISOString(),
        remarks,
    };
    db.taskHistory.push(newRecord);
};

const api = {
    login: (role: Role): Promise<User> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = role === Role.ADMIN ? db.users[0] : db.users[1];
                resolve(user);
            }, 500);
        });
    },
    getDashboardStats: (userId: string, role: Role) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (role === Role.ADMIN) {
                    resolve({
                        totalTasks: db.tasks.length,
                        completedTasks: db.tasks.filter(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED).length,
                        pendingTasks: db.tasks.filter(t => t.status === TaskStatus.YET_TO_START || t.status === TaskStatus.IN_PROGRESS).length,
                        pendingApprovals: db.tasks.filter(t => t.status === TaskStatus.PENDING_APPROVAL).length,
                    });
                } else {
                    const userTasks = db.tasks.filter(t => t.assignedTo.includes(userId));
                    resolve({
                        assignedTasks: userTasks.length,
                        myPendingTasks: userTasks.filter(t => t.status === TaskStatus.YET_TO_START || t.status === TaskStatus.IN_PROGRESS).length,
                        myCompletedTasks: userTasks.filter(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED || t.status === TaskStatus.PENDING_APPROVAL).length,
                    });
                }
            }, 700);
        });
    },
    getTasks: (): Promise<Task[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...db.tasks]), 500);
        });
    },
    getTaskById: (taskId: string): Promise<Task | undefined> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(db.tasks.find(t => t._id === taskId));
            }, 300);
        });
    },
    getUsers: (): Promise<User[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(db.users.filter(u => u.role !== Role.ADMIN)), 300);
        });
    },
    getAllUsers: (): Promise<User[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...db.users]), 300);
        });
    },
    createTask: (taskData: Omit<Task, '_id' | 'createdAt' | 'createdBy' | 'teamHead'>): Promise<Task> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTask: Task = {
                    ...taskData,
                    _id: `t${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    createdBy: 'u001', // Assume admin creates it
                    teamHead: 'u001',
                };
                db.tasks.push(newTask);
                addHistoryRecord(newTask._id, TaskStatus.YET_TO_START, 'u001');
                saveDb(db);
                resolve(newTask);
            }, 1000);
        });
    },
    updateTask: (taskId: string, taskData: Partial<Omit<Task, '_id'>>): Promise<Task> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const taskIndex = db.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    const originalTask = db.tasks[taskIndex];
                    db.tasks[taskIndex] = { ...originalTask, ...taskData };
                    
                    if (taskData.status && originalTask.status !== taskData.status) {
                        addHistoryRecord(taskId, taskData.status, 'u001');
                    }
                    saveDb(db);
                    resolve(db.tasks[taskIndex]);
                } else {
                    reject(new Error('Task not found'));
                }
            }, 500);
        });
    },
    deleteTask: (taskId: string): Promise<{ success: boolean }> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const initialLength = db.tasks.length;
                db.tasks = db.tasks.filter(t => t._id !== taskId);
                if (db.tasks.length < initialLength) {
                    db.submissions = db.submissions.filter(s => s.taskId !== taskId);
                    db.taskHistory = db.taskHistory.filter(h => h.taskId !== taskId);
                    saveDb(db);
                    resolve({ success: true });
                } else {
                    reject(new Error('Task not found'));
                }
            }, 500);
        });
    },
    getPendingApprovals: (): Promise<Task[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(db.tasks.filter(t => t.status === TaskStatus.PENDING_APPROVAL)), 500);
        });
    },
    getSubmissionsForTask: (taskId: string): Promise<Submission[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const submissions = db.submissions.filter(s => s.taskId === taskId);
                resolve(submissions);
            }, 300);
        });
    },
    submitTask: (submissionData: { taskId: string, employeeId: string, submittedFiles: string[], remarks: string }): Promise<Submission> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newSubmission: Submission = {
                    ...submissionData,
                    _id: `s${Date.now()}`,
                    status: 'Pending Approval',
                    submittedAt: new Date().toISOString(),
                };
                db.submissions.push(newSubmission);

                const taskIndex = db.tasks.findIndex(t => t._id === submissionData.taskId);
                if (taskIndex > -1) {
                    db.tasks[taskIndex].status = TaskStatus.PENDING_APPROVAL;
                    addHistoryRecord(submissionData.taskId, TaskStatus.PENDING_APPROVAL, submissionData.employeeId);
                }
                saveDb(db);
                resolve(newSubmission);
            }, 800);
        });
    },
    approveTask: (taskId: string): Promise<Task> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const taskIndex = db.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    db.tasks[taskIndex].status = TaskStatus.APPROVED;
                    addHistoryRecord(taskId, TaskStatus.APPROVED, 'u001');
                    saveDb(db);
                    resolve(db.tasks[taskIndex]);
                } else {
                    reject(new Error('Task not found'));
                }
            }, 500);
        });
    },
    rejectTask: (taskId: string, remarks: string): Promise<Task> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const taskIndex = db.tasks.findIndex(t => t._id === taskId);
                if (taskIndex > -1) {
                    db.tasks[taskIndex].status = TaskStatus.IN_PROGRESS;
                    addHistoryRecord(taskId, TaskStatus.IN_PROGRESS, 'u001', remarks);
                    saveDb(db);
                    resolve(db.tasks[taskIndex]);
                } else {
                    reject(new Error('Task not found'));
                }
            }, 500);
        });
    },
    approveTasks: (taskIds: string[]): Promise<{ success: boolean }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                taskIds.forEach(taskId => {
                    const taskIndex = db.tasks.findIndex(t => t._id === taskId);
                    if (taskIndex > -1) {
                        db.tasks[taskIndex].status = TaskStatus.APPROVED;
                        addHistoryRecord(taskId, TaskStatus.APPROVED, 'u001');
                    }
                });
                saveDb(db);
                resolve({ success: true });
            }, 800);
        });
    },
    rejectTasks: (taskIds: string[], remarks: string): Promise<{ success: boolean }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                taskIds.forEach(taskId => {
                    const taskIndex = db.tasks.findIndex(t => t._id === taskId);
                    if (taskIndex > -1) {
                        db.tasks[taskIndex].status = TaskStatus.IN_PROGRESS;
                        addHistoryRecord(taskId, TaskStatus.IN_PROGRESS, 'u001', remarks);
                    }
                });
                saveDb(db);
                resolve({ success: true });
            }, 800);
        });
    },
    getTaskHistory: (taskId: string): Promise<TaskHistory[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const history = db.taskHistory
                    .filter(h => h.taskId === taskId)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                resolve(history);
            }, 400);
        });
    },
    getTeams: (): Promise<Team[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...db.teams]), 400));
    },
    createTeam: (name: string): Promise<Team> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newTeam: Team = {
                    _id: `team${Date.now()}`,
                    name,
                    members: [],
                };
                db.teams.push(newTeam);
                saveDb(db);
                resolve(newTeam);
            }, 500);
        });
    },
    addMemberToTeam: (teamId: string, userId: string): Promise<Team> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const team = db.teams.find(t => t._id === teamId);
                if (team && !team.members.includes(userId)) {
                    team.members.push(userId);
                    saveDb(db);
                    resolve(team);
                } else {
                    reject(new Error('Team not found or member already exists'));
                }
            }, 300);
        });
    },
    removeMemberFromTeam: (teamId: string, userId: string): Promise<Team> => {
         return new Promise((resolve, reject) => {
            setTimeout(() => {
                const team = db.teams.find(t => t._id === teamId);
                if (team) {
                    team.members = team.members.filter(id => id !== userId);
                    saveDb(db);
                    resolve(team);
                } else {
                    reject(new Error('Team not found'));
                }
            }, 300);
        });
    },
    deleteTeam: (teamId: string): Promise<{ success: boolean }> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = db.teams.findIndex(t => t._id === teamId);
                if (index > -1) {
                    db.teams.splice(index, 1);
                    // Also remove this team from any tasks it was assigned to
                    db.tasks.forEach(task => {
                        if (task.assignedTeams?.includes(teamId)) {
                            task.assignedTeams = task.assignedTeams.filter(id => id !== teamId);
                        }
                    });
                    saveDb(db);
                    resolve({ success: true });
                } else {
                    reject(new Error('Team not found'));
                }
            }, 500);
        });
    },
    getAnnouncements: (): Promise<Announcement[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...db.announcements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }, 300);
        });
    },
    createAnnouncement: (title: string, content: string): Promise<Announcement> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newAnnouncement: Announcement = {
                    _id: `ann${Date.now()}`,
                    title,
                    content,
                    createdAt: new Date().toISOString(),
                };
                db.announcements.push(newAnnouncement);
                saveDb(db);
                resolve(newAnnouncement);
            }, 500);
        });
    },
    deleteAnnouncement: (id: string): Promise<{ success: boolean }> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = db.announcements.findIndex(ann => ann._id === id);
                if (index > -1) {
                    db.announcements.splice(index, 1);
                    saveDb(db);
                    resolve({ success: true });
                } else {
                    reject(new Error('Announcement not found'));
                }
            }, 400);
        });
    },
    getTimeEntries: (userId?: string): Promise<TimeEntry[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                if (userId) {
                    resolve(db.timeEntries.filter(entry => entry.userId === userId));
                } else {
                    resolve([...db.timeEntries]);
                }
            }, 600);
        });
    },
    createTimeEntry: (entryData: Omit<TimeEntry, '_id' | 'createdAt'>): Promise<TimeEntry> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newEntry: TimeEntry = {
                    ...entryData,
                    _id: `te${Date.now()}`,
                    createdAt: new Date().toISOString(),
                };
                db.timeEntries.push(newEntry);
                saveDb(db);
                resolve(newEntry);
            }, 500);
        });
    }
};

export default api;
