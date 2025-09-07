
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Palette, 
  Users, 
  Database, 
  HelpCircle, 
  Link2, 
  Languages,
  Smartphone,
  Download,
  Share2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePWA } from '@/hooks/usePWA';
import MobileSettingsLayout, { SettingsMenuItem } from '@/components/mobile/MobileSettingsLayout';

const SettingsIndexPage = () => {
  const { profile } = useAuth();
  const { isInstallable, isInstalled, installApp, shareApp, canInstall } = usePWA();

  const settingsGroups = [
    {
      title: "Account",
      items: [
        {
          icon: <User className="h-5 w-5" />,
          title: "Personal Information",
          description: "Manage your profile and account details",
          href: "/settings/account"
        }
      ]
    },
    {
      title: "Privacy & Security", 
      items: [
        {
          icon: <Shield className="h-5 w-5" />,
          title: "Privacy & Security",
          description: "Control who can see your information and location sharing",
          href: "/settings/privacy"
        },
        {
          icon: <Users className="h-5 w-5" />,
          title: "Blocked Users",
          description: "Manage blocked accounts",
          href: "/settings/blocked-users"
        }
      ]
    },
    {
      title: "Preferences",
      items: [
        {
          icon: <Bell className="h-5 w-5" />,
          title: "Notifications",
          description: "Configure notification preferences", 
          href: "/settings/notifications"
        },
        {
          icon: <Globe className="h-5 w-5" />,
          title: "Discovery",
          description: "Set discovery radius and preferences",
          href: "/settings/discovery"
        },
        {
          icon: <Palette className="h-5 w-5" />,
          title: "Appearance",
          description: "Customize the look and feel",
          href: "/settings/appearance"
        },
        {
          icon: <Languages className="h-5 w-5" />,
          title: "Language",
          description: "Choose your preferred language",
          href: "/settings/language"
        }
      ]
    },
    {
      title: "App Management",
      items: [
        {
          icon: <Database className="h-5 w-5" />,
          title: "Data Management", 
          description: "Export or delete your data",
          href: "/settings/data-management"
        },
        {
          icon: <Link2 className="h-5 w-5" />,
          title: "Linked Accounts",
          description: "Connect social media accounts",
          href: "/settings/linked-accounts"  
        },
        {
          icon: <HelpCircle className="h-5 w-5" />,
          title: "Help & Support",
          description: "Get help and contact support",
          href: "/settings/help"
        }
      ]
    }
  ];

  return (
    <MobileSettingsLayout
      title="Settings"
      subtitle="Manage your account and app preferences"
    >
      {/* Profile Summary */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url ?? ""} alt={profile?.username ?? "avatar"} />
              <AvatarFallback className="text-lg">
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg truncate">
                {profile?.full_name || profile?.username || "User"}
              </h2>
              <p className="text-muted-foreground truncate">
                @{profile?.username || "username"}
              </p>
              <Badge variant="secondary" className="mt-1">
                Account Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PWA Installation */}
      {!isInstalled && isInstallable && (
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Install App</h3>
                  <p className="text-sm text-muted-foreground">Get the full mobile experience</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={installApp} disabled={!canInstall}>
                  <Download className="h-4 w-4 mr-1" />
                  Install
                </Button>
                <Button variant="outline" size="sm" onClick={shareApp}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Groups */}
      <div className="space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {group.title}
            </h3>
            <div className="space-y-2">
              {group.items.map((item) => (
                <SettingsMenuItem
                  key={item.href}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  href={item.href}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </MobileSettingsLayout>
  );
};

export default SettingsIndexPage;
