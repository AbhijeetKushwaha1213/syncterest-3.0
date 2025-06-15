
import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, User, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const MobileBottomNav = () => {
    const location = useLocation();
    const { profile } = useAuth();

    const profileLink = profile?.username ? `/profile/${profile.id}` : '/settings/account';

    const navItems = [
        { href: "/home", icon: Home, label: "Home" },
        { href: "/chat", icon: MessageCircle, label: "Chat" },
        { href: "/channels", icon: Hash, label: "Channels" },
        { href: profileLink, icon: User, label: "Profile" },
    ];

    const isProfileActive = location.pathname.startsWith('/profile/') || location.pathname.startsWith('/settings');

    return (
        <footer className="fixed bottom-0 left-0 right-0 border-t bg-background z-10 md:hidden">
            <nav className="flex justify-around items-center h-16 max-w-2xl mx-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary",
                             (item.label === 'Profile' ? isProfileActive : location.pathname.startsWith(item.href)) && "text-primary"
                        )}
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </footer>
    );
};

export default MobileBottomNav;
