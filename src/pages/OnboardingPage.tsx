
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BasicInfoStep from "@/components/onboarding/BasicInfoStep";
import PersonalityStep from "@/components/onboarding/PersonalityStep";
import InterestsStep from "@/components/onboarding/InterestsStep";
import { usePersonalityResponses } from "@/hooks/usePersonalityResponses";

interface OnboardingData {
  // Basic info
  full_name: string;
  age: number;
  gender: string;
  height: string;
  ethnicity: string;
  
  // Personality responses
  conversation_style: string;
  sports_excitement: string;
  group_behavior: string;
  social_energy: string;
  weekend_recharge: string;
  new_experiences: string;
  
  // Interests
  interests: string[];
}

const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { saveResponses } = usePersonalityResponses();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    full_name: "",
    age: 18,
    gender: "",
    height: "",
    ethnicity: "",
    conversation_style: "",
    sports_excitement: "",
    group_behavior: "",
    social_energy: "",
    weekend_recharge: "",
    new_experiences: "",
    interests: [],
  });

  const updateData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update profile with basic info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: onboardingData.full_name,
          interests: onboardingData.interests,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Save personality responses
      const personalityData = {
        gender: onboardingData.gender,
        height: onboardingData.height,
        ethnicity: onboardingData.ethnicity,
        conversation_style: onboardingData.conversation_style,
        sports_excitement: onboardingData.sports_excitement,
        group_behavior: onboardingData.group_behavior,
        social_energy: onboardingData.social_energy,
        weekend_recharge: onboardingData.weekend_recharge,
        new_experiences: onboardingData.new_experiences,
      };

      saveResponses(personalityData);

      toast({
        title: "Profile setup complete!",
        description: "Welcome to Spark. Let's find your perfect matches!",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error completing setup",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Let's set up your profile</CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">Step {currentStep} of 3</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <BasicInfoStep 
              data={onboardingData} 
              updateData={updateData}
              onNext={nextStep}
            />
          )}
          
          {currentStep === 2 && (
            <PersonalityStep 
              data={onboardingData} 
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 3 && (
            <InterestsStep 
              data={onboardingData} 
              updateData={updateData}
              onPrev={prevStep}
              onComplete={handleComplete}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
