
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import AccountPage from "./pages/Account";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import UserProfilePage from "./pages/UserProfilePage";
import LoggedInLayout from "./components/LoggedInLayout";
import ChannelsPage from "./pages/ChannelsPage";
import SearchPage from "./pages/SearchPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import EventDetailPage from "./pages/EventDetailPage";
import ChannelDetailPage from "./pages/ChannelDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="/channels" element={<ChannelsPage />} />
            <Route path="/channels/:id" element={<ChannelDetailPage />} />
            <Route path="/account" element={<AccountPage />} />
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
  </QueryClientProvider>
);

export default App;
