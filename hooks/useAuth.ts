
import { useContext } from 'react';
// Corrected to import from AuthContext.tsx instead of a non-existent file
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
