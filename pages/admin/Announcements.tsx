import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, Plus, Trash2, Loader2 } from 'lucide-react';
import api from '../../services/mockApi';
import { Announcement } from '../../types';

const Announcements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        const data = await api.getAnnouncements();
        setAnnouncements(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError('Both title and content are required.');
            return;
        }
        setError('');
        setIsProcessing(true);
        await api.createAnnouncement(title, content);
        setTitle('');
        setContent('');
        await fetchAnnouncements();
        setIsProcessing(false);
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            await api.deleteAnnouncement(id);
            await fetchAnnouncements();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-dark-component p-6 rounded-lg border border-dark-border">
                    <h3 className="text-xl font-bold text-text-light mb-4 flex items-center">
                        <Megaphone size={22} className="mr-3 text-primary" />
                        Create Announcement
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="announcement-title" className="block text-sm font-medium text-text-medium mb-1">Title</label>
                            <input
                                id="announcement-title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Office Holiday"
                            />
                        </div>
                        <div>
                            <label htmlFor="announcement-content" className="block text-sm font-medium text-text-medium mb-1">Content</label>
                            <textarea
                                id="announcement-content"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={5}
                                className="w-full bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Detailed message..."
                            />
                        </div>
                        {error && <p className="text-sm text-danger">{error}</p>}
                        <button type="submit" disabled={isProcessing} className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-white bg-primary hover:bg-secondary disabled:bg-primary/50 transition-colors">
                            {isProcessing ? <Loader2 className="animate-spin mr-2" size={20} /> : <Plus className="mr-2" size={20} />}
                            Post Announcement
                        </button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="bg-dark-component p-6 rounded-lg border border-dark-border">
                    <h3 className="text-xl font-bold text-text-light mb-4">Posted Announcements</h3>
                    {loading ? (
                         <div className="text-center text-text-medium">Loading...</div>
                    ) : (
                        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                            {announcements.length === 0 ? (
                                <p className="text-text-medium text-center py-4">No announcements posted yet.</p>
                            ) : (
                                announcements.map(ann => (
                                    <div key={ann._id} className="bg-dark-bg p-4 rounded-lg border border-dark-border relative group">
                                        <button onClick={() => handleDelete(ann._id)} className="absolute top-3 right-3 text-danger/50 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Announcement">
                                            <Trash2 size={16} />
                                        </button>
                                        <h4 className="font-semibold text-text-light">{ann.title}</h4>
                                        <p className="text-sm text-text-medium mt-1 mb-2">{ann.content}</p>
                                        <p className="text-xs text-text-medium/70">{new Date(ann.createdAt).toLocaleString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Announcements;
