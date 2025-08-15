
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import PersonalityTest from "@/pages/PersonalityTest";
import Messages from "@/pages/Messages";
import MessageDetail from "@/pages/MessageDetail";
import EventDetail from "@/pages/EventDetail";
import Events from "@/pages/Events";
import CreateEvent from "@/pages/CreateEvent";
import NearbyUsers from "@/pages/NearbyUsers";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import GlobalSearch from "@/pages/GlobalSearch";
import NotificationCenter from "@/pages/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/personality-test" element={<PersonalityTest />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:id" element={<MessageDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/nearby" element={<NearbyUsers />} />
        <Route path="/search" element={<GlobalSearch />} />
        <Route path="/notifications" element={<NotificationCenter />} />
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
