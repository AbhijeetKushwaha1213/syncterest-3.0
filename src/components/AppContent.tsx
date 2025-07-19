import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import LoggedInLayout from "@/components/LoggedInLayout";
import HomePage from "@/pages/HomePage";
import ChatPage from "@/pages/ChatPage";
import SearchPage from "@/pages/SearchPage";
import UserProfilePage from "@/pages/UserProfilePage";
import OnboardingPage from "@/pages/OnboardingPage";
import GroupsPage from "@/pages/GroupsPage";
import GroupDetailPage from "@/pages/GroupDetailPage";
import EventDetailPage from "@/pages/EventDetailPage";
import ChannelsLayout from "@/pages/ChannelsLayout";
import ChannelDetailPage from "@/pages/ChannelDetailPage";
import ChannelsDiscovery from "@/pages/ChannelsDiscovery";
import ChannelPlaceholder from "@/pages/ChannelPlaceholder";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/NotFound";
import AccountSettingsPage from "@/pages/settings/AccountSettingsPage";
import PrivacySettingsPage from "@/pages/settings/PrivacySettingsPage";
import NotificationsSettingsPage from "@/pages/settings/NotificationsSettingsPage";
import AppearanceSettingsPage from "@/pages/settings/AppearanceSettingsPage";
import LanguageSettingsPage from "@/pages/settings/LanguageSettingsPage";
import HelpSettingsPage from "@/pages/settings/HelpSettingsPage";
import DataManagementSettingsPage from "@/pages/settings/DataManagementSettingsPage";
import LinkedAccountsSettingsPage from "@/pages/settings/LinkedAccountsSettingsPage";
import DiscoverySettingsPage from "@/pages/settings/DiscoverySettingsPage";
import BlockedUsersSettingsPage from "@/pages/settings/BlockedUsersSettingsPage";
import { supabase } from "@/integrations/supabase/client";

const AppContent = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Check onboarding status when user changes
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setOnboardingComplete(null);
        setCheckingOnboarding(false);
        return;
      }

      try {
        // Check if profile has basic info and interests with better validation
        const hasBasicInfo = !!(profile?.full_name && profile?.username);
        const hasInterests = !!(profile?.interests && Array.isArray(profile.interests) && profile.interests.length > 0);
        
        // Check if personality responses exist
        const { data: personalityData, error } = await supabase
          .from('personality_responses')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const hasPersonalityData = !error && !!personalityData;
        
        // Only mark as complete if ALL requirements are met
        const isComplete = hasBasicInfo && hasInterests && hasPersonalityData;
        setOnboardingComplete(isComplete);
        
        console.log('Onboarding status:', {
          hasBasicInfo,
          hasInterests,
          hasPersonalityData,
          isComplete,
          profile: profile ? 'loaded' : 'not loaded'
        });
        
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setOnboardingComplete(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    // Only check if we have user and profile data
    if (user && (profile !== undefined || !loading)) {
      checkOnboardingStatus();
    } else if (!user) {
      setOnboardingComplete(null);
      setCheckingOnboarding(false);
    }
  }, [user, profile, loading]);

  // Handle redirects after login/onboarding
  useEffect(() => {
    if (loading || checkingOnboarding) return;

    const currentPath = location.pathname;
    
    // If user is authenticated
    if (user) {
      // Skip redirects if already on onboarding page
      if (currentPath === '/onboarding') return;
      
      // If onboarding is not complete, redirect to onboarding
      if (onboardingComplete === false) {
        navigate('/onboarding', { replace: true });
        return;
      }
      
      // If onboarding is complete and user is on auth pages, redirect to home
      if (onboardingComplete === true && ['/login', '/signup', '/'].includes(currentPath)) {
        navigate('/home', { replace: true });
        return;
      }
    } else {
      // If user is not authenticated and trying to access protected routes
      const protectedRoutes = ['/home', '/chat', '/profile', '/onboarding', '/settings'];
      const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
      
      if (isProtectedRoute) {
        navigate('/', { replace: true });
        return;
      }
    }
  }, [user, loading, checkingOnboarding, onboardingComplete, navigate, location.pathname]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected routes - require authentication */}
        {user ? (
          <>
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            {/* Main app routes - require completed onboarding */}
            {onboardingComplete && (
              <>
                <Route path="/home" element={<LoggedInLayout />}>
                  <Route index element={<HomePage />} />
                </Route>
                <Route path="/chat" element={<LoggedInLayout />}>
                  <Route index element={<ChatPage />} />
                  <Route path=":conversationId" element={<ChatPage />} />
                </Route>
                <Route path="/search" element={<LoggedInLayout />}>
                  <Route index element={<SearchPage />} />
                </Route>
                <Route path="/profile/:userId" element={<LoggedInLayout />}>
                  <Route index element={<UserProfilePage />} />
                </Route>
                <Route path="/groups" element={<LoggedInLayout />}>
                  <Route index element={<GroupsPage />} />
                </Route>
                <Route path="/groups/:groupId" element={<LoggedInLayout />}>
                  <Route index element={<GroupDetailPage />} />
                </Route>
                <Route path="/events/:eventId" element={<LoggedInLayout />}>
                  <Route index element={<EventDetailPage />} />
                </Route>
                
                {/* Channels */}
                <Route path="/channels" element={<LoggedInLayout />}>
                  <Route element={<ChannelsLayout />}>
                    <Route index element={<ChannelsDiscovery />} />
                    <Route path="discover" element={<ChannelsDiscovery />} />
                    <Route path=":channelId" element={<ChannelDetailPage />} />
                    <Route path="placeholder" element={<ChannelPlaceholder />} />
                  </Route>
                </Route>
                
                {/* Settings */}
                <Route path="/settings/account" element={<LoggedInLayout />}>
                  <Route index element={<AccountSettingsPage />} />
                </Route>
                <Route path="/settings/privacy" element={<LoggedInLayout />}>
                  <Route index element={<PrivacySettingsPage />} />
                </Route>
                <Route path="/settings/notifications" element={<LoggedInLayout />}>
                  <Route index element={<NotificationsSettingsPage />} />
                </Route>
                <Route path="/settings/appearance" element={<LoggedInLayout />}>
                  <Route index element={<AppearanceSettingsPage />} />
                </Route>
                <Route path="/settings/language" element={<LoggedInLayout />}>
                  <Route index element={<LanguageSettingsPage />} />
                </Route>
                <Route path="/settings/help" element={<LoggedInLayout />}>
                  <Route index element={<HelpSettingsPage />} />
                </Route>
                <Route path="/settings/data-management" element={<LoggedInLayout />}>
                  <Route index element={<DataManagementSettingsPage />} />
                </Route>
                <Route path="/settings/linked-accounts" element={<LoggedInLayout />}>
                  <Route index element={<LinkedAccountsSettingsPage />} />
                </Route>
                <Route path="/settings/discovery" element={<LoggedInLayout />}>
                  <Route index element={<DiscoverySettingsPage />} />
                </Route>
                <Route path="/settings/blocked-users" element={<LoggedInLayout />}>
                  <Route index element={<BlockedUsersSettingsPage />} />
                </Route>
                
                <Route path="*" element={<LoggedInLayout />}>
                  <Route index element={<NotFound />} />
                </Route>
              </>
            )}
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
      <Toaster />
    </SidebarProvider>
  );
};

export default AppContent;
