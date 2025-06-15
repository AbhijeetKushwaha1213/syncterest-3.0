import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import UserProfilePage from "./pages/UserProfilePage";
import LoggedInLayout from "./components/LoggedInLayout";
import SearchPage from "./pages/SearchPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import EventDetailPage from "./pages/EventDetailPage";
import ChannelDetailPage from "./pages/ChannelDetailPage";
import ChannelsLayout from "./pages/ChannelsLayout";
import ChannelPlaceholder from "./pages/ChannelPlaceholder";
import SettingsLayout from "./components/settings/SettingsLayout";
import AccountSettingsPage from "./pages/settings/AccountSettingsPage";
import PrivacySettingsPage from "./pages/settings/PrivacySettingsPage";
import NotificationsSettingsPage from "./pages/settings/NotificationsSettingsPage";
import AppearanceSettingsPage from "./pages/settings/AppearanceSettingsPage";
import LanguageSettingsPage from "./pages/settings/LanguageSettingsPage";
import { ThemeProvider } from "./components/ThemeProvider";
import BlockedUsersSettingsPage from "./pages/settings/BlockedUsersSettingsPage";
import DataManagementSettingsPage from "./pages/settings/DataManagementSettingsPage";
import HelpSettingsPage from "./pages/settings/HelpSettingsPage";
import LinkedAccountsSettingsPage from "./pages/settings/LinkedAccountsSettingsPage";
import SubscriptionSettingsPage from "./pages/settings/SubscriptionSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            <Route element={<LoggedInLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/chat/:conversationId?" element={<ChatPage />} />
              
              <Route path="/channels" element={<ChannelsLayout />}>
                <Route index element={<ChannelPlaceholder />} />
                <Route path=":id" element={<ChannelDetailPage />} />
              </Route>
              
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="/settings/account" replace />} />
                <Route path="account" element={<AccountSettingsPage />} />
                <Route path="privacy" element={<PrivacySettingsPage />} />
                <Route path="notifications" element={<NotificationsSettingsPage />} />
                <Route path="appearance" element={<AppearanceSettingsPage />} />
                <Route path="language" element={<LanguageSettingsPage />} />
                <Route path="linked-accounts" element={<LinkedAccountsSettingsPage />} />
                <Route path="subscription" element={<SubscriptionSettingsPage />} />
                <Route path="data-management" element={<DataManagementSettingsPage />} />
                <Route path="blocked-users" element={<BlockedUsersSettingsPage />} />
                <Route path="help" element={<HelpSettingsPage />} />
              </Route>
              
              <Route path="/profile/:id" element={<UserProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/groups/:id" element={<GroupDetailPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
