
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Index = () => {
  const { session, user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Wait until auth state is determined

    if (session) {
      // If a session exists, we shouldn't be on the landing page.
      if (profile?.username) {
        navigate('/home');
      } else {
        // This can happen briefly while profile is loading, or if profile is incomplete.
        // The user needs to complete their profile on the account settings page.
        navigate('/settings/account');
      }
    }
  }, [loading, session, profile, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  
  // While loading or if logged in, show a spinner/loader.
  // The useEffect above will handle redirection.
  if (loading || session) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link to="/" className="flex items-center justify-center">
          <span className="text-xl font-bold">syncterest</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <>
            <Link
              to="/login"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Login
            </Link>
            <Link to="/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-20 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Meet. Create. Connect.
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  syncterest helps you find people nearby to play sports, discuss ideas, or build something amazing together. Ditch the endless scrolling and start making real connections.
                </p>
              </div>
              <div className="space-x-4">
                <Link to="/signup">
                  <Button size="lg">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Find Your Crew
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Whatever your passion, find others who share it. From pickup basketball games to collaborative art projects, your next adventure is just a connection away.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} syncterest. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link to="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link to="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Index;
