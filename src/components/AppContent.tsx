
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import OnboardingPage from "@/pages/OnboardingPage";
import LoggedInLayout from "@/components/LoggedInLayout";
import HomePage from "@/pages/HomePage";
import ChatPage from "@/pages/ChatPage";
import UserProfilePage from "@/pages/UserProfilePage";
import SearchPage from "@/pages/SearchPage";
import EventDetailPage from "@/pages/EventDetailPage";
import NotFound from "@/pages/NotFound";
import SettingsLayout from "@/components/settings/SettingsLayout";
import AccountSettingsPage from "@/pages/settings/AccountSettingsPage";
import PrivacySettingsPage from "@/pages/settings/PrivacySettingsPage";
import NotificationsSettingsPage from "@/pages/settings/NotificationsSettingsPage";
import AppearanceSettingsPage from "@/pages/settings/AppearanceSettingsPage";
import LanguageSettingsPage from "@/pages/settings/LanguageSettingsPage";
import BlockedUsersSettingsPage from "@/pages/settings/BlockedUsersSettingsPage";
import LinkedAccountsSettingsPage from "@/pages/settings/LinkedAccountsSettingsPage";
import DataManagementSettingsPage from "@/pages/settings/DataManagementSettingsPage";
import HelpSettingsPage from "@/pages/settings/HelpSettingsPage";
import DiscoverySettingsPage from "@/pages/settings/DiscoverySettingsPage";
import GroupsPage from "@/pages/GroupsPage";

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/home" replace /> : <Index />} 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Protected routes */}
      <Route 
        path="/onboarding" 
        element={user ? <OnboardingPage /> : <Navigate to="/login" replace />} 
      />
      
      {/* Main protected routes */}
      <Route 
        path="/*" 
        element={user ? <LoggedInLayout /> : <Navigate to="/login" replace />}
      >
        <Route path="home" element={<HomePage />} />
        <Route path="chat/:conversationId?" element={<ChatPage />} />
        <Route path="profile/:id" element={<UserProfilePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="events/:eventId" element={<EventDetailPage />} />
        
        
        {/* Settings routes with nested layout */}
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="/settings/account" replace />} />
          <Route path="account" element={<AccountSettingsPage />} />
          <Route path="privacy" element={<PrivacySettingsPage />} />
          <Route path="notifications" element={<NotificationsSettingsPage />} />
          <Route path="appearance" element={<AppearanceSettingsPage />} />
          <Route path="language" element={<LanguageSettingsPage />} />
          <Route path="discovery" element={<DiscoverySettingsPage />} />
          <Route path="linked-accounts" element={<LinkedAccountsSettingsPage />} />
          <Route path="data-management" element={<DataManagementSettingsPage />} />
          <Route path="blocked-users" element={<BlockedUsersSettingsPage />} />
          <Route path="help" element={<HelpSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppContent;
