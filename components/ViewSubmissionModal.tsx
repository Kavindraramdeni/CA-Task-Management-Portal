import React from 'react';
import { X, FileText, MessageSquare, Loader2, Download } from 'lucide-react';
import { Submission, Task } from '../types';

interface ViewSubmissionModalProps {
    isOpen: boolean;
    isProcessing?: boolean;
    onClose: () => void;
    onApprove?: (taskId: string) => void;
    onReject?: (taskId: string) => void;
    task: Task | null;
    submission: Submission | null;
}

const ViewSubmissionModal: React.FC<ViewSubmissionModalProps> = ({ isOpen, isProcessing, onClose, onApprove, onReject, task, submission }) => {
    if (!isOpen || !task || !submission) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-dark-component rounded-lg shadow-xl w-full max-w-2xl border border-dark-border transform transition-all">
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h3 className="text-lg font-semibold text-text-light">Review Submission: <span className="text-primary">{task.clientName}</span></h3>
                    <button onClick={onClose} className="text-text-medium hover:text-text-light p-1 rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h4 className="text-md font-semibold text-text-light mb-2 flex items-center"><FileText size={18} className="mr-2 text-secondary" /> Submitted Files</h4>
                        <ul className="space-y-2 pl-2">
                            {submission.submittedFiles.map((file, index) => (
                                <li key={index}>
                                    <a 
                                      href="#" 
                                      onClick={(e) => e.preventDefault()} 
                                      title="Download file (demo)"
                                      className="flex items-center bg-dark-bg p-2 rounded-md text-sm text-secondary hover:underline hover:text-primary transition-colors"
                                    >
                                        <Download size={16} className="mr-3 flex-shrink-0" />
                                        <span>{file}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                         {submission.submittedFiles.length === 0 && <p className="text-text-medium text-sm pl-2">No files were submitted.</p>}
                    </div>
                     <div>
                        <h4 className="text-md font-semibold text-text-light mb-2 flex items-center"><MessageSquare size={18} className="mr-2 text-secondary" /> Employee Remarks</h4>
                        <div className="bg-dark-bg p-4 rounded-md border-l-4 border-primary/50">
                            <p className="text-text-medium italic">
                                {submission.remarks || "No remarks provided."}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-dark-bg/50 px-6 py-3 flex justify-end items-center space-x-3 rounded-b-lg">
                    {onApprove && onReject ? (
                        <>
                            <button onClick={() => onReject(task._id)} disabled={isProcessing} className="flex items-center justify-center px-4 py-2 rounded-lg text-red-400 bg-danger/20 hover:bg-danger/30 disabled:opacity-50 transition-colors">
                                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : 'Reject'}
                            </button>
                            <button onClick={() => onApprove(task._id)} disabled={isProcessing} className="flex items-center justify-center px-4 py-2 rounded-lg text-green-400 bg-success/20 hover:bg-success/30 disabled:opacity-50 transition-colors">
                                 {isProcessing ? <Loader2 className="animate-spin" size={18} /> : 'Approve'}
                            </button>
                        </>
                    ) : (
                         <button onClick={onClose} className="px-4 py-2 rounded-lg text-text-light bg-dark-border/50 hover:bg-dark-border transition-colors">
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewSubmissionModal;