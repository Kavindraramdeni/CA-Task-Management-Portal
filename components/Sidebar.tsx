import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

interface NavLinkItem {
    name: string;
    path: string;
    icon: React.ReactNode;
}

interface SidebarProps {
    navLinks: NavLinkItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navLinks }) => {
    return (
        <aside className="w-64 bg-dark-component text-text-light flex flex-col h-screen fixed border-r border-dark-border">
            <div className="flex items-center justify-center p-6 border-b border-dark-border">
                <ShieldCheck className="text-primary" size={28} />
                <h1 className="text-xl font-bold ml-2 text-text-light">CA Portal</h1>
            </div>
            <nav className="flex-1 p-4">
                <ul>
                    {navLinks.map((link) => (
                        <li key={link.name}>
                            <NavLink
                                to={link.path}
                                className={({ isActive }) =>
                                    `flex items-center p-3 my-1 rounded-md transition-colors text-sm font-medium border-l-4 ${
                                        isActive
                                            ? 'bg-primary/10 text-primary border-primary'
                                            : 'border-transparent text-text-medium hover:bg-white/5 hover:text-text-light'
                                    }`
                                }
                            >
                                {link.icon}
                                <span className="ml-4">{link.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;