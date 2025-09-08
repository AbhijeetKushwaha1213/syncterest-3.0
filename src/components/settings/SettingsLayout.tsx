
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User, Shield, Bell, Paintbrush, Languages, Link, DatabaseZap, CircleSlash, HelpCircle, Compass } from 'lucide-react';
import SectionErrorBoundary from '../SectionErrorBoundary';

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
  {
    title: "Language",
    href: "/settings/language",
    icon: Languages,
  },
  {
    title: "Discovery",
    href: "/settings/discovery",
    icon: Compass,
  },
  {
    title: "Linked Accounts",
    href: "/settings/linked-accounts",
    icon: Link,
  },
  {
    title: "Data Management",
    href: "/settings/data-management",
    icon: DatabaseZap,
  },
  {
    title: "Blocked Users",
    href: "/settings/blocked-users",
    icon: CircleSlash,
  },
  {
    title: "Help & Support",
    href: "/settings/help",
    icon: HelpCircle,
  },
];

const SettingsLayout = () => {
  return (
    <div className="container max-w-5xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">Settings</h1>
        <div className="flex flex-col space-y-6 sm:space-y-8 lg:flex-row lg:space-x-8 xl:space-x-12 lg:space-y-0">
            <aside className="lg:w-1/5">
                <SectionErrorBoundary sectionName="Settings Navigation">
                  <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
                  {sidebarNavItems.map((item) => (
                      <NavLink
                          key={item.href}
                          to={item.href}
                          className={({ isActive }) => cn(
                              'inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap flex-shrink-0 lg:flex-shrink',
                              isActive
                              ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
                              : 'hover:bg-accent hover:text-accent-foreground',
                              'justify-start px-3 py-2 sm:px-4 min-w-fit lg:w-full'
                          )}
                      >
                          <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm lg:text-sm">{item.title}</span>
                      </NavLink>
                  ))}
                  </nav>
                </SectionErrorBoundary>
            </aside>
            <div className="flex-1 lg:max-w-4xl px-2 sm:px-0">
                <SectionErrorBoundary sectionName="Settings Content">
                  <Outlet />
                </SectionErrorBoundary>
            </div>
        </div>
    </div>
  );
};

export default SettingsLayout;
