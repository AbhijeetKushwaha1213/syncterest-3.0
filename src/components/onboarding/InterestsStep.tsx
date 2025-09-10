
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface InterestsStepProps {
  data: {
    interests: string[];
  };
  updateData: (data: any) => void;
  onPrev: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
  onSkip?: () => void;
}

const InterestsStep = ({ data, updateData, onPrev, onComplete, isSubmitting, onSkip }: InterestsStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableInterests = [
    "Music", "Food", "Books", "Hiking", "Tech", "Travel", "Photography", "Art",
    "Sports", "Gaming", "Movies", "Fitness", "Cooking", "Dancing", "Writing",
    "Nature", "Fashion", "Coffee", "Wine", "Yoga", "Running", "Swimming",
    "Cycling", "Meditation", "Volunteering", "Learning", "Shopping", "Pets"
  ];

  const toggleInterest = (interest: string) => {
    const currentInterests = data.interests || [];
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    updateData({ interests: newInterests });
  };

  const validateAndComplete = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.interests || data.interests.length < 3) {
      newErrors.interests = "Please select at least 3 interests";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Interests</h2>
        <p className="text-muted-foreground">Select at least 3 interests to help us find compatible matches</p>
      </div>

      <div>
        <Label className="text-base font-medium">Available Interests</Label>
        <div className="flex flex-wrap gap-2 mt-3">
          {availableInterests.map((interest) => (
            <Badge
              key={interest}
              variant={data.interests?.includes(interest) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => toggleInterest(interest)}
            >
              {interest}
              {data.interests?.includes(interest) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
        {errors.interests && (
          <p className="text-sm text-destructive mt-2">{errors.interests}</p>
        )}
      </div>

      {data.interests && data.interests.length > 0 && (
        <div>
          <Label className="text-base font-medium">Selected Interests ({data.interests.length})</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.interests.map((interest) => (
              <Badge key={interest} className="bg-primary text-primary-foreground">
                {interest}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => toggleInterest(interest)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          size="lg"
          className="flex-1"
        >
          Back
        </Button>
        {onSkip && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            size="lg"
            className="flex-1"
          >
            Skip
          </Button>
        )}
        <Button
          type="button"
          onClick={validateAndComplete}
          size="lg"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Setting up...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
};

export default InterestsStep;
