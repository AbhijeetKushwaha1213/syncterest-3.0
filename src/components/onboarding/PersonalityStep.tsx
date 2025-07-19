
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PersonalityStepProps {
  data: {
    conversation_style: string;
    sports_excitement: string;
    group_behavior: string;
    social_energy: string;
    weekend_recharge: string;
    new_experiences: string;
  };
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PersonalityStep = ({ data, updateData, onNext, onPrev }: PersonalityStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const questions = [
    {
      key: 'conversation_style',
      question: 'What do you focus on in a conversation?',
      options: [
        { value: 'factual-details', label: 'Factual and specific details' },
        { value: 'clear-direct', label: 'Clear and direct talk' },
        { value: 'deeper-emotions', label: 'Deeper meanings and emotions' },
        { value: 'future-ideas', label: 'Future possibilities and ideas' },
      ]
    },
    {
      key: 'sports_excitement',
      question: 'What excites you most about sports or activities?',
      options: [
        { value: 'real-time-moment', label: 'Sharing the real-time moment' },
        { value: 'learning-mastering', label: 'Learning and mastering skills' },
        { value: 'group-chemistry', label: 'Exploring chemistry and group energy' },
      ]
    },
    {
      key: 'group_behavior',
      question: 'In a group setting, you usually:',
      options: [
        { value: 'take-lead', label: 'Take lead and energize others' },
        { value: 'join-share', label: 'Join in and share ideas' },
        { value: 'listen-speak', label: 'Listen and speak when asked' },
        { value: 'stay-quiet', label: 'Stay quiet and observe' },
      ]
    },
    {
      key: 'social_energy',
      question: 'After social events, how do you feel?',
      options: [
        { value: 'energized-more', label: 'Energized and want more' },
        { value: 'need-recharge', label: 'Need some recharge time' },
        { value: 'drained-overstimulated', label: 'Drained or overstimulated' },
      ]
    },
    {
      key: 'weekend_recharge',
      question: 'Your preferred weekend recharge:',
      options: [
        { value: 'large-gatherings', label: 'Large gatherings or parties' },
        { value: 'small-groups', label: 'Small group hangouts' },
        { value: 'quiet-alone', label: 'Quiet time alone' },
        { value: 'close-people', label: 'Outings with 1–2 close people' },
      ]
    },
    {
      key: 'new_experiences',
      question: 'How do you approach new experiences?',
      options: [
        { value: 'stick-to-known', label: 'Stick to what you know' },
        { value: 'try-if-cool', label: 'Try it if it seems cool' },
        { value: 'jump-unexpected', label: 'Jump into anything unexpected' },
      ]
    }
  ];

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};
    
    questions.forEach(question => {
      if (!data[question.key as keyof typeof data]) {
        newErrors[question.key] = "Please select an option";
      }
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Personality Profile</h2>
        <p className="text-muted-foreground">Help us understand your personality to find better matches</p>
      </div>

      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.key} className="space-y-3">
            <Label className="text-base font-medium">{question.question}</Label>
            <RadioGroup
              value={data[question.key as keyof typeof data]}
              onValueChange={(value) => updateData({ [question.key]: value })}
              className="space-y-2"
            >
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${question.key}-${option.value}`} />
                  <Label htmlFor={`${question.key}-${option.value}`} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors[question.key] && (
              <p className="text-sm text-destructive">{errors[question.key]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          Back
        </Button>
        <Button onClick={validateAndNext} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default PersonalityStep;
