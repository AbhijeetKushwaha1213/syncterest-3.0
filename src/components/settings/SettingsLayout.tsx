import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User, Shield, Bell, Paintbrush } from 'lucide-react';

const sidebarNavItems = [
  {
    title: "Account",
    href: "/settings/account",
    icon: User,
  },
  {
    title: "Privacy & Security",
    href: "/settings/privacy",
    icon: Shield,
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
    icon: Paintbrush,
  },
];

const SettingsLayout = () => {
  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
                <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                {sidebarNavItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) => cn(
                            'inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
                            isActive
                            ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
                            : 'hover:bg-accent hover:text-accent-foreground',
                            'justify-start px-4 py-2'
                        )}
                    >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                    </NavLink>
                ))}
                </nav>
            </aside>
            <div className="flex-1 lg:max-w-4xl">
                <Outlet />
            </div>
        </div>
    </div>
  );
};

export default SettingsLayout;
