import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Users, UserPlus, Trash2, X, Loader2 } from 'lucide-react';
import api from '../../services/mockApi';
import { Team, User } from '../../types';

const userColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];
const getColorForId = (id: string) => userColors[parseInt(id.replace('u', '')) % userColors.length];
const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
        return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
};


const Teams: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState<Team | null>(null);
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [teamsData, usersData] = await Promise.all([
            api.getTeams(),
            api.getUsers()
        ]);
        setTeams(teamsData);
        setUsers(usersData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getUserById = (id: string) => users.find(u => u._id === id);

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return;
        setIsProcessing(true);
        await api.createTeam(newTeamName);
        await fetchData();
        setShowCreateModal(false);
        setNewTeamName('');
        setIsProcessing(false);
    };

    const handleAddMember = async () => {
        if (!selectedUser || !showAddMemberModal) return;
        setIsProcessing(true);
        await api.addMemberToTeam(showAddMemberModal._id, selectedUser);
        await fetchData();
        setShowAddMemberModal(null);
        setSelectedUser('');
        setIsProcessing(false);
    };
    
    const handleRemoveMember = async (teamId: string, userId: string) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            await api.removeMemberFromTeam(teamId, userId);
            await fetchData();
        }
    };
    
    const handleDeleteTeam = async (teamId: string) => {
        if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
            await api.deleteTeam(teamId);
            await fetchData();
        }
    };

    const availableUsersForTeam = showAddMemberModal
        ? users.filter(u => !showAddMemberModal.members.includes(u._id))
        : [];

    if (loading) {
        return <div className="text-center text-text-medium p-8">Loading teams...</div>;
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-text-light">Manage Teams</h3>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors shadow-md hover:shadow-lg"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        Create New Team
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {teams.map(team => (
                        <div key={team._id} className="bg-dark-component rounded-lg border border-dark-border p-5 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-xl font-bold text-text-light">{team.name}</h4>
                                    <p className="text-sm text-text-medium">{team.members.length} member(s)</p>
                                </div>
                                <button onClick={() => handleDeleteTeam(team._id)} className="text-danger/70 hover:text-danger p-1" title="Delete Team">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="space-y-2 flex-grow">
                                {team.members.map(userId => {
                                    const user = getUserById(userId);
                                    return (
                                        <div key={userId} className="flex items-center justify-between bg-dark-bg p-2 rounded-md">
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-dark-component ${getColorForId(user?._id || 'u000')}`}>
                                                    {getInitials(user?.name || '?')}
                                                </div>
                                                <span className="ml-3 text-sm font-medium text-text-light">{user?.name || 'Unknown User'}</span>
                                            </div>
                                            <button onClick={() => handleRemoveMember(team._id, userId)} className="text-danger/60 hover:text-danger p-1 rounded-full">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <button onClick={() => setShowAddMemberModal(team)} className="mt-4 w-full flex items-center justify-center text-sm bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30 transition-colors">
                                <UserPlus size={16} className="mr-2" /> Add Member
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Team Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-component rounded-lg shadow-xl w-full max-w-md border border-dark-border">
                        <div className="flex justify-between items-center p-4 border-b border-dark-border">
                            <h3 className="text-lg font-semibold text-text-light">Create a New Team</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-text-medium hover:text-text-light"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <label htmlFor="teamName" className="block text-sm font-medium text-text-medium">Team Name</label>
                            <input
                                id="teamName"
                                type="text"
                                value={newTeamName}
                                onChange={e => setNewTeamName(e.target.value)}
                                className="w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Senior Auditors"
                            />
                        </div>
                        <div className="bg-dark-bg/50 px-6 py-3 flex justify-end items-center space-x-3 rounded-b-lg">
                            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-text-light bg-dark-border/50 hover:bg-dark-border">Cancel</button>
                            <button onClick={handleCreateTeam} disabled={isProcessing} className="flex items-center justify-center px-4 py-2 rounded-lg text-white bg-primary hover:bg-secondary disabled:bg-primary/50">
                                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Add Member Modal */}
            {showAddMemberModal && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-component rounded-lg shadow-xl w-full max-w-md border border-dark-border">
                        <div className="flex justify-between items-center p-4 border-b border-dark-border">
                            <h3 className="text-lg font-semibold text-text-light">Add Member to <span className="text-primary">{showAddMemberModal.name}</span></h3>
                            <button onClick={() => setShowAddMemberModal(null)} className="text-text-medium hover:text-text-light"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                             <label htmlFor="userSelect" className="block text-sm font-medium text-text-medium">Select Employee</label>
                             <select
                                id="userSelect"
                                value={selectedUser}
                                onChange={e => setSelectedUser(e.target.value)}
                                className="w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                             >
                                <option value="" disabled>-- Choose an employee --</option>
                                {availableUsersForTeam.map(user => (
                                    <option key={user._id} value={user._id}>{user.name}</option>
                                ))}
                             </select>
                             {availableUsersForTeam.length === 0 && <p className="text-sm text-text-medium text-center">All employees are already in this team.</p>}
                        </div>
                         <div className="bg-dark-bg/50 px-6 py-3 flex justify-end items-center space-x-3 rounded-b-lg">
                            <button onClick={() => setShowAddMemberModal(null)} className="px-4 py-2 rounded-lg text-text-light bg-dark-border/50 hover:bg-dark-border">Cancel</button>
                            <button onClick={handleAddMember} disabled={isProcessing || !selectedUser} className="flex items-center justify-center px-4 py-2 rounded-lg text-white bg-primary hover:bg-secondary disabled:bg-primary/50">
                                 {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Add Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Teams;
