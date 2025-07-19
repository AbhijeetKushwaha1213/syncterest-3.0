
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingBoundary from "@/components/LoadingBoundary";

// Pages
import Index from "../pages/Index";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/Login";
import SignUpPage from "../pages/SignUp";
import OnboardingPage from "../pages/OnboardingPage";
import ChatPage from "../pages/ChatPage";
import UserProfilePage from "../pages/UserProfilePage";
import SearchPage from "../pages/SearchPage";
import NotFound from "../pages/NotFound";
import ChannelsLayout from "../pages/ChannelsLayout";
import ChannelDetailPage from "../pages/ChannelDetailPage";
import ChannelPlaceholder from "../pages/ChannelPlaceholder";
import ChannelsDiscovery from "../pages/ChannelsDiscovery";
import GroupsPage from "../pages/GroupsPage";
import GroupDetailPage from "../pages/GroupDetailPage";
import EventDetailPage from "../pages/EventDetailPage";

// Settings Pages
import AccountSettingsPage from "../pages/settings/AccountSettingsPage";
import NotificationsSettingsPage from "../pages/settings/NotificationsSettingsPage";
import PrivacySettingsPage from "../pages/settings/PrivacySettingsPage";
import AppearanceSettingsPage from "../pages/settings/AppearanceSettingsPage";
import BlockedUsersSettingsPage from "../pages/settings/BlockedUsersSettingsPage";
import LinkedAccountsSettingsPage from "../pages/settings/LinkedAccountsSettingsPage";
import DataManagementSettingsPage from "../pages/settings/DataManagementSettingsPage";
import LanguageSettingsPage from "../pages/settings/LanguageSettingsPage";
import HelpSettingsPage from "../pages/settings/HelpSettingsPage";
import DiscoverySettingsPage from "../pages/settings/DiscoverySettingsPage";

import SettingsLayout from "./settings/SettingsLayout";
import LoggedInLayout from "./LoggedInLayout";

const AppContent = () => {
  const { user, loading } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsOnboarded(null);
        return;
      }

      try {
        // Check if user has completed basic profile setup
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, interests')
          .eq('id', user.id)
          .single();

        // Check if user has personality responses
        const { data: personalityData } = await supabase
          .from('personality_responses')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // User is onboarded if they have a full name, interests, and personality data
        const userIsOnboarded = !!(profile?.full_name && 
                                  profile?.interests?.length && 
                                  personalityData);

        setIsOnboarded(userIsOnboarded);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboarded(false); // Default to not onboarded if there's an error
      }
    };

    checkOnboardingStatus();
  }, [user]);

  if (loading || (user && isOnboarded === null)) {
    return (
      <LoadingBoundary 
        isLoading={true}
        children={<div>Loading...</div>}
      />
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <LoginPage />
          } />
          <Route path="/signup" element={
            user ? <Navigate to="/" replace /> : <SignUpPage />
          } />
          
          {/* Onboarding route */}
          <Route path="/onboarding" element={
            !user ? <Navigate to="/" replace /> :
            isOnboarded === true ? <Navigate to="/home" replace /> :
            <OnboardingPage />
          } />

          {/* Protected routes with LoggedInLayout wrapper */}
          <Route path="/" element={
            !user ? <Index /> :
            isOnboarded === false ? <Navigate to="/onboarding" replace /> :
            <Navigate to="/home" replace />
          } />

          <Route path="/home" element={
            !user ? <Navigate to="/" replace /> :
            isOnboarded === false ? <Navigate to="/onboarding" replace /> :
            <LoggedInLayout />
          }>
            <Route index element={<HomePage />} />
          </Route>

          <Route element={
            !user ? <Navigate to="/" replace /> :
            isOnboarded === false ? <Navigate to="/onboarding" replace /> :
            <LoggedInLayout />
          }>
            <Route path="chat/:conversationId?" element={<ChatPage />} />
            <Route path="profile/:userId" element={<UserProfilePage />} />
            <Route path="search" element={<SearchPage />} />
            
            {/* Settings routes nested under LoggedInLayout */}
            <Route path="settings/*" element={<SettingsLayout />}>
              <Route index element={<Navigate to="/settings/account" replace />} />
              <Route path="account" element={<AccountSettingsPage />} />
              <Route path="notifications" element={<NotificationsSettingsPage />} />
              <Route path="privacy" element={<PrivacySettingsPage />} />
              <Route path="appearance" element={<AppearanceSettingsPage />} />
              <Route path="blocked-users" element={<BlockedUsersSettingsPage />} />
              <Route path="linked-accounts" element={<LinkedAccountsSettingsPage />} />
              <Route path="data-management" element={<DataManagementSettingsPage />} />
              <Route path="language" element={<LanguageSettingsPage />} />
              <Route path="help" element={<HelpSettingsPage />} />
              <Route path="discovery" element={<DiscoverySettingsPage />} />
            </Route>

            {/* Channel routes nested under LoggedInLayout */}
            <Route path="channels/*" element={<ChannelsLayout />}>
              <Route index element={<ChannelPlaceholder />} />
              <Route path="discovery" element={<ChannelsDiscovery />} />
              <Route path=":channelId" element={<ChannelDetailPage />} />
            </Route>

            {/* Groups routes nested under LoggedInLayout */}
            <Route path="groups" element={<GroupsPage />} />
            <Route path="groups/:groupId" element={<GroupDetailPage />} />

            {/* Events routes nested under LoggedInLayout */}
            <Route path="events/:eventId" element={<EventDetailPage />} />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppContent;
