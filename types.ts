export enum Role {
    ADMIN = 'admin',
    EMPLOYEE = 'employee',
}

export enum TaskPriority {
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
}

export enum TaskStatus {
    YET_TO_START = 'Yet to Start',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
    PENDING_APPROVAL = 'Pending Approval',
    APPROVED = 'Approved',
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: Role;
    team: string;
    createdAt: string;
}

export interface Task {
    _id: string;
    clientName: string;
    clientGroup: string;
    priority: TaskPriority;
    inwardDate: string;
    dueDate: string;
    targetDate: string;
    internalWork: boolean;
    assignedTo: string[]; // Array of user IDs
    assignedTeams: string[]; // Array of team IDs
    teamHead: string; // User ID
    guides: string[]; // Array of guide IDs
    status: TaskStatus;
    description: string;
    workType: string[];
    attachments: string[]; // URLs or file paths
    createdBy: string; // User ID
    createdAt: string;
}

export interface Submission {
    _id: string;
    taskId: string;
    employeeId: string;
    submittedFiles: string[];
    remarks: string;
    status: 'Pending Approval' | 'Approved' | 'Rejected';
    submittedAt: string;
}

export interface Team {
    _id: string;
    name: string;
    members: string[]; // Array of user IDs
}

export interface Announcement {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}

export interface TimeEntry {
    _id: string;
    userId: string;
    taskId: string;
    date: string;
    hours: number;
    description: string;
    createdAt: string;
}

export interface TaskHistory {
    _id: string;
    taskId: string;
    newStatus: TaskStatus;
    changedBy: string; // User ID
    timestamp: string;
    remarks?: string; // For rejection feedback
}