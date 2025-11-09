import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { EMPLOYEE_NAV_LINKS } from '../constants';

const EmployeeLayout: React.FC = () => {
    const location = useLocation();
    const currentLink = EMPLOYEE_NAV_LINKS.find(link => location.pathname.startsWith(link.path));
    const pageTitle = currentLink ? currentLink.name : 'Employee';

    return (
        <div className="flex h-screen bg-dark-bg">
            <Sidebar navLinks={EMPLOYEE_NAV_LINKS} />
            <main className="flex-1 flex flex-col ml-64">
                <Header title={pageTitle} />
                <div className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default EmployeeLayout;