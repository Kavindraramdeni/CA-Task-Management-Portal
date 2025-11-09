import React from 'react';

interface DashboardCardProps {
    title: string;
    value: number | string;
    // The specific React.ReactElement type specifies that the icon element accepts
    // custom props like `size` and `className`, resolving a potential TypeScript issue.
    icon: React.ReactElement<{ size?: number | string; className?: string }>;
    iconColor: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, iconColor }) => {
    return (
        <div className="bg-dark-component rounded-lg p-5 flex items-center justify-between border border-dark-border">
            <div>
                <p className="text-sm text-text-medium font-medium uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold text-text-light mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${iconColor}`}>
                {React.cloneElement(icon, { size: 24, className: 'text-white' })}
            </div>
        </div>
    );
};

export default DashboardCard;
