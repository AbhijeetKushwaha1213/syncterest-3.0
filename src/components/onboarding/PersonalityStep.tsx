
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { usePersonalityResponses } from "@/hooks/usePersonalityResponses";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const questions = [
  {
    id: 'group_behavior',
    question: 'In group settings, I tend to:',
    options: [
      { value: 'lead', label: 'Take charge and lead the conversation' },
      { value: 'participate', label: 'Actively participate and contribute' },
      { value: 'observe', label: 'Listen and observe before contributing' },
      { value: 'support', label: 'Support others and help facilitate' }
    ]
  },
  {
    id: 'social_energy',
    question: 'I get my energy from:',
    options: [
      { value: 'social', label: 'Being around people and socializing' },
      { value: 'balanced', label: 'A mix of social time and alone time' },
      { value: 'quiet', label: 'Quiet time and deep conversations' },
      { value: 'solitude', label: 'Spending time alone or with close friends' }
    ]
  },
  {
    id: 'day_planning',
    question: 'My ideal day is:',
    options: [
      { value: 'structured', label: 'Well-planned with a clear schedule' },
      { value: 'flexible', label: 'Loosely planned with room for spontaneity' },
      { value: 'spontaneous', label: 'Completely spontaneous and unplanned' },
      { value: 'mixed', label: 'A mix of planned activities and free time' }
    ]
  },
  {
    id: 'conversation_style',
    question: 'When communicating, I prefer to:',
    options: [
      { value: 'direct', label: 'Be direct and straightforward' },
      { value: 'diplomatic', label: 'Be diplomatic and considerate' },
      { value: 'expressive', label: 'Be expressive and animated' },
      { value: 'thoughtful', label: 'Be thoughtful and measured' }
    ]
  },
  {
    id: 'new_experiences',
    question: 'When facing new experiences, I:',
    options: [
      { value: 'embrace', label: 'Embrace them with enthusiasm' },
      { value: 'cautious', label: 'Approach them cautiously but positively' },
      { value: 'research', label: 'Research and prepare thoroughly first' },
      { value: 'gradual', label: 'Prefer gradual introduction to new things' }
    ]
  }
];

interface PersonalityStepProps {
  onComplete: () => void;
}

const PersonalityStep = ({ onComplete }: PersonalityStepProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveResponses } = usePersonalityResponses();
  const { user } = useAuth();
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete onboarding.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Saving personality responses:', responses);
      
      // Save personality responses with only the fields that exist in the database
      await saveResponses({
        group_behavior: responses.group_behavior,
        social_energy: responses.social_energy,
        day_planning: responses.day_planning,
        conversation_style: responses.conversation_style,
        new_experiences: responses.new_experiences
      });
      
      console.log('Personality responses saved successfully');
      
      // Mark onboarding as complete in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      console.log('Profile updated successfully');

      toast({
        title: "🎉 Welcome!",
        description: "You're all set! Welcome to your new social experience.",
      });

      // Call the onComplete callback to trigger navigation
      onComplete();
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = responses[currentQuestion.id];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Progress value={progress} className="mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={responses[currentQuestion.id] || ''}
            onValueChange={handleAnswerSelect}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label 
                  htmlFor={option.value}
                  className="text-sm leading-relaxed cursor-pointer flex-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0 || isSubmitting}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
            >
              {isSubmitting 
                ? "Finishing..." 
                : currentQuestionIndex === questions.length - 1 
                  ? "Complete Setup" 
                  : "Next"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalityStep;
