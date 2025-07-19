
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BasicInfoStep from "@/components/onboarding/BasicInfoStep";
import InterestsStep from "@/components/onboarding/InterestsStep";
import PersonalityStep from "@/components/onboarding/PersonalityStep";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState({});
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleBasicInfoComplete = (data: any) => {
    setBasicInfo(data);
    setCurrentStep(2);
  };

  const handleInterestsComplete = (interests: string[]) => {
    setSelectedInterests(interests);
    setCurrentStep(3);
  };

  const handlePersonalityComplete = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Authentication required to complete onboarding.",
        variant: "destructive",
      });
      return;
    }

    setIsCompleting(true);

    try {
      // Update the user's profile with all onboarding data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...basicInfo,
          interests: selectedInterests,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      // Show success message
      toast({
        title: "🎉 Welcome!",
        description: "You're all set! Welcome to your new social experience.",
      });

      // Small delay to show the toast, then redirect
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1500);

    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Setup Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
      setIsCompleting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep onComplete={handleBasicInfoComplete} />;
      case 2:
        return <InterestsStep onComplete={handleInterestsComplete} />;
      case 3:
        return <PersonalityStep onComplete={handlePersonalityComplete} />;
      default:
        return <BasicInfoStep onComplete={handleBasicInfoComplete} />;
    }
  };

  if (isCompleting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold">Completing your setup...</h2>
          <p className="text-muted-foreground">Just a moment while we personalize your experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="max-w-2xl mx-auto px-6">
            <h1 className="text-3xl font-bold text-center mb-2">Welcome! Let's get you set up</h1>
            <p className="text-muted-foreground text-center mb-4">
              Step {currentStep} of {totalSteps}
            </p>
            <Progress value={progress} className="mb-6" />
          </div>
        </div>
        
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default OnboardingPage;
