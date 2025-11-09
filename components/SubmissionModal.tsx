import React, { useState } from 'react';
import { X, File, UploadCloud, Loader2 } from 'lucide-react';

interface SubmissionModalProps {
    taskName: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (files: File[], remarks: string) => Promise<void>;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({ taskName, isOpen, onClose, onSubmit }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(prev => [...prev, ...Array.from(event.target.files!)]);
        }
    };

    const removeFile = (fileName: string) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await onSubmit(files, remarks);
        setIsSubmitting(false);
        // Reset state after submission
        setFiles([]);
        setRemarks('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-dark-component rounded-lg shadow-xl w-full max-w-lg border border-dark-border transform transition-all">
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h3 className="text-lg font-semibold text-text-light">Submit Work for: <span className="text-primary">{taskName}</span></h3>
                    <button onClick={onClose} className="text-text-medium hover:text-text-light p-1 rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-medium mb-2">Upload Files</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dark-border border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-text-medium" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-dark-bg rounded-md font-medium text-primary hover:text-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary p-1">
                                        <span>Upload files</span>
                                        <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1 text-text-medium">or drag and drop</p>
                                </div>
                                <p className="text-xs text-text-medium">Any files up to 10MB</p>
                            </div>
                        </div>
                    </div>
                    {files.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-text-medium">Selected files:</h4>
                            <ul className="max-h-32 overflow-y-auto space-y-1 pr-2">
                                {files.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between bg-dark-bg p-2 rounded-md text-sm">
                                        <div className="flex items-center truncate">
                                            <File size={16} className="mr-2 text-text-medium flex-shrink-0" />
                                            <span className="text-text-light truncate" title={file.name}>{file.name}</span>
                                        </div>
                                        <button onClick={() => removeFile(file.name)} className="text-danger hover:text-red-400 ml-2 p-1 rounded-full flex-shrink-0">
                                            <X size={14} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-text-medium">Description (Optional)</label>
                        <textarea
                            id="remarks"
                            rows={4}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full mt-1 bg-dark-bg rounded-lg px-4 py-2 border border-dark-border text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                <div className="bg-dark-bg/50 px-6 py-3 flex justify-end items-center space-x-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-text-light bg-dark-border/50 hover:bg-dark-border transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting || files.length === 0} className="flex items-center justify-center px-4 py-2 rounded-lg text-white bg-primary hover:bg-secondary disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                        Submit Work
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionModal;