
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ChevronDown, LogOut, User as UserIcon, Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <header className="bg-dark-component shadow-sm p-4 flex justify-between items-center z-10 border-b border-dark-border">
            <h2 className="text-2xl font-semibold text-text-light">{title}</h2>
            
            <div className="flex items-center space-x-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-medium" size={20} />
                    <input type="text" placeholder="Search tasks, clients..." className="bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2 text-text-light placeholder-text-medium focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <button className="p-2 rounded-full hover:bg-white/5">
                    <Bell className="text-text-medium" />
                </button>

                {user && (
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5">
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {user.name.charAt(0)}
                            </div>
                            <span className="text-text-light font-medium hidden sm:inline">{user.name}</span>
                            <ChevronDown size={16} className="text-text-medium" />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-dark-component rounded-md shadow-lg py-1 z-50 border border-dark-border">
                                <div className="px-4 py-2 text-sm text-text-medium border-b border-dark-border">
                                    <p className="font-bold text-text-light">{user.name}</p>
                                    <p className="capitalize">{user.role}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-danger hover:bg-red-500/10"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
