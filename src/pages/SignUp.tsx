
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  const getErrorMessage = (error: any) => {
    if (!error?.message) return "An unexpected error occurred";
    
    const message = error.message.toLowerCase();
    
    if (message.includes("user already registered")) {
      return "An account with this email already exists. Please try logging in instead.";
    }
    if (message.includes("weak password")) {
      return "Password is too weak. Please choose a stronger password (at least 6 characters).";
    }
    if (message.includes("email address invalid")) {
      return "Please enter a valid email address.";
    }
    if (message.includes("signup is disabled")) {
      return "Account registration is currently disabled. Please contact support.";
    }
    
    return error.message;
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      
      if (error) {
        console.error("Sign up error:", error);
        toast({
          title: "Error signing up",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } else if (data.user) {
        console.log("Sign up successful:", data.user.email);
        toast({
          title: "Success!",
          description: data.user.email_confirmed_at 
            ? "Account created successfully! You can now log in."
            : "Please check your email to confirm your account before logging in.",
        });
        
        // If email is auto-confirmed, redirect to home, otherwise to login
        if (data.user.email_confirmed_at) {
          navigate("/");
        } else {
          navigate("/login");
        }
      }
    } catch (err) {
      console.error("Unexpected sign up error:", err);
      toast({
        title: "Error signing up",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started with Spark.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                minLength={6} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="At least 6 characters"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
