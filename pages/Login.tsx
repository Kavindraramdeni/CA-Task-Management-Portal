
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { ShieldCheck, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loadingRole, setLoadingRole] = useState<Role | null>(null);

    const handleLogin = async (role: Role) => {
        setLoadingRole(role);
        await login(role);
        if (role === Role.ADMIN) {
            navigate('/admin/dashboard');
        } else {
            navigate('/employee/dashboard');
        }
        setLoadingRole(null);
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-dark-component border border-dark-border shadow-2xl rounded-2xl p-8 space-y-8">
                <div className="text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-6 text-3xl font-extrabold text-text-light">
                        CA Task Management Portal
                    </h2>
                    <p className="mt-2 text-sm text-text-medium">
                        Please select your role to login.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <button
                        onClick={() => handleLogin(Role.ADMIN)}
                        disabled={loadingRole !== null}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/50 transition-transform hover:scale-105"
                    >
                        {loadingRole === Role.ADMIN ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            'Login as Admin'
                        )}
                    </button>
                    <button
                        onClick={() => handleLogin(Role.EMPLOYEE)}
                        disabled={loadingRole !== null}
                        className="w-full flex justify-center items-center py-3 px-4 border border-dark-border rounded-lg shadow-sm text-sm font-medium text-text-light bg-dark-border/50 hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-dark-border/20 transition-transform hover:scale-105"
                    >
                        {loadingRole === Role.EMPLOYEE ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            'Login as Employee'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
