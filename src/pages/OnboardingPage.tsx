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
  const [basicInfo, setBasicInfo] = useState({
    full_name: '',
    age: 18,
    gender: '',
    height: '',
    ethnicity: '',
    interests: [] as string[]
  });
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const updateBasicInfo = (updates: any) => {
    setBasicInfo(prev => ({ ...prev, ...updates }));
  };

  const handleBasicInfoNext = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Authentication required to continue onboarding.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save basic info to profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: basicInfo.full_name,
          username: basicInfo.full_name.toLowerCase().replace(/\s+/g, ''),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving basic info:', error);
        throw error;
      }

      setCurrentStep(2);
    } catch (error) {
      console.error('Error saving basic info:', error);
      toast({
        title: "Error",
        description: "Failed to save basic information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInterestsComplete = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Authentication required to continue onboarding.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save interests to profile
      const { error } = await supabase
        .from('profiles')
        .update({
          interests: basicInfo.interests,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving interests:', error);
        throw error;
      }

      setCurrentStep(3);
    } catch (error) {
      console.error('Error saving interests:', error);
      toast({
        title: "Error",
        description: "Failed to save interests. Please try again.",
        variant: "destructive",
      });
    }
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
      console.log('Starting onboarding completion process');
      
      // Final profile update to mark onboarding as complete
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
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
        description: "You're all set! Redirecting to your dashboard...",
      });

      console.log('Onboarding completed successfully, redirecting to home');
      
      // Use navigate instead of window.location for better React Router integration
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1000);

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
        return (
          <BasicInfoStep 
            data={basicInfo}
            updateData={updateBasicInfo}
            onNext={handleBasicInfoNext}
          />
        );
      case 2:
        return (
          <InterestsStep 
            data={basicInfo}
            updateData={updateBasicInfo}
            onPrev={() => setCurrentStep(1)}
            onComplete={handleInterestsComplete}
            isSubmitting={false}
          />
        );
      case 3:
        return <PersonalityStep onComplete={handlePersonalityComplete} />;
      default:
        return (
          <BasicInfoStep 
            data={basicInfo}
            updateData={updateBasicInfo}
            onNext={handleBasicInfoNext}
          />
        );
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
