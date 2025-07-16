
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
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
    
    if (message.includes("email not confirmed")) {
      return "Please check your email and click the confirmation link before logging in.";
    }
    if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (message.includes("too many requests")) {
      return "Too many login attempts. Please wait a moment before trying again.";
    }
    if (message.includes("user not found")) {
      return "No account found with this email address. Please sign up first.";
    }
    if (message.includes("weak password")) {
      return "Password is too weak. Please choose a stronger password.";
    }
    if (message.includes("email address invalid")) {
      return "Please enter a valid email address.";
    }
    
    return error.message;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        toast({
          title: "Error logging in",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } else if (data.user) {
        console.log("Login successful:", data.user.email);
        toast({
          title: "Logged in successfully!",
          description: "Welcome back.",
        });
        navigate("/");
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      toast({
        title: "Error logging in",
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
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to continue to Spark.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
