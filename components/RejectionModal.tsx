import React, { useState } from 'react';
import { X, MessageSquare, Loader2 } from 'lucide-react';

interface RejectionModalProps {
    isOpen: boolean;
    isProcessing: boolean;
    onClose: () => void;
    onSubmit: (remarks: string) => void;
    taskCount: number;
}

const RejectionModal: React.FC<RejectionModalProps> = ({ isOpen, isProcessing, onClose, onSubmit, taskCount }) => {
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!remarks.trim()) {
            setError('Rejection remarks are required.');
            return;
        }
        setError('');
        onSubmit(remarks);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-dark-component rounded-lg shadow-xl w-full max-w-lg border border-dark-border transform transition-all">
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h3 className="text-lg font-semibold text-text-light">Reject Submission(s)</h3>
                    <button onClick={onClose} className="text-text-medium hover:text-text-light p-1 rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-text-medium">
                        You are about to reject <span className="font-bold text-primary">{taskCount}</span> task(s). Please provide a reason for the rejection. This will be visible to the employee.
                    </p>
                    <div>
                        <label htmlFor="rejection-remarks" className="block text-sm font-medium text-text-medium mb-1 flex items-center">
                            <MessageSquare size={14} className="mr-2" />
                            Rejection Remarks
                        </label>
                        <textarea
                            id="rejection-remarks"
                            rows={5}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className={`w-full mt-1 bg-dark-bg rounded-lg px-4 py-2 border text-text-light focus:outline-none focus:ring-2 ${error ? 'border-danger focus:ring-danger' : 'border-dark-border focus:ring-primary'}`}
                            placeholder="e.g., Please revise section 3 based on the new guidelines..."
                        />
                         {error && <p className="text-xs text-danger mt-1">{error}</p>}
                    </div>
                </div>
                <div className="bg-dark-bg/50 px-6 py-3 flex justify-end items-center space-x-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-text-light bg-dark-border/50 hover:bg-dark-border transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing} className="flex items-center justify-center px-4 py-2 rounded-lg text-white bg-danger hover:bg-red-500 disabled:bg-danger/50 transition-colors">
                        {isProcessing ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                        Submit Rejection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectionModal;