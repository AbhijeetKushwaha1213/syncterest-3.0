
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BasicInfoStepProps {
  data: {
    full_name: string;
    age: number;
    gender: string;
    height: string;
    ethnicity: string;
  };
  updateData: (data: any) => void;
  onNext: () => void;
}

const BasicInfoStep = ({ data, updateData, onNext }: BasicInfoStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndNext = () => {
    console.log('BasicInfoStep: Validating data:', data);
    const newErrors: Record<string, string> = {};
    
    if (!data.full_name.trim()) {
      newErrors.full_name = "Name is required";
    }
    
    if (data.age < 18 || data.age > 100) {
      newErrors.age = "Age must be between 18 and 100";
    }
    
    if (!data.gender) {
      newErrors.gender = "Please select your gender";
    }

    console.log('BasicInfoStep: Validation errors:', newErrors);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('BasicInfoStep: Validation passed, calling onNext');
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <p className="text-muted-foreground">Tell us a bit about yourself</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={data.full_name}
            onChange={(e) => {
              console.log('BasicInfoStep: Updating full_name:', e.target.value);
              updateData({ full_name: e.target.value });
            }}
            placeholder="Enter your full name"
          />
          {errors.full_name && (
            <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min="18"
            max="100"
            value={data.age}
            onChange={(e) => {
              const newAge = parseInt(e.target.value) || 18;
              console.log('BasicInfoStep: Updating age:', newAge);
              updateData({ age: newAge });
            }}
          />
          {errors.age && (
            <p className="text-sm text-destructive mt-1">{errors.age}</p>
          )}
        </div>

        <div>
          <Label>Gender</Label>
          <RadioGroup
            value={data.gender}
            onValueChange={(value) => {
              console.log('BasicInfoStep: Updating gender:', value);
              updateData({ gender: value });
            }}
            className="grid grid-cols-2 gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="man" id="man" />
              <Label htmlFor="man">Man</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="woman" id="woman" />
              <Label htmlFor="woman">Woman</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="non-binary" id="non-binary" />
              <Label htmlFor="non-binary">Non-binary</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
              <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
            </div>
          </RadioGroup>
          {errors.gender && (
            <p className="text-sm text-destructive mt-1">{errors.gender}</p>
          )}
        </div>

        <div>
          <Label htmlFor="height">Height (optional)</Label>
          <Input
            id="height"
            value={data.height}
            onChange={(e) => {
              console.log('BasicInfoStep: Updating height:', e.target.value);
              updateData({ height: e.target.value });
            }}
            placeholder="e.g., 5'8&quot; or 173cm"
          />
        </div>

        <div>
          <Label htmlFor="ethnicity">Ethnicity (optional)</Label>
          <Input
            id="ethnicity"
            value={data.ethnicity}
            onChange={(e) => {
              console.log('BasicInfoStep: Updating ethnicity:', e.target.value);
              updateData({ ethnicity: e.target.value });
            }}
            placeholder="Your ethnic background"
          />
        </div>
      </div>

      <Button onClick={validateAndNext} className="w-full">
        Continue
      </Button>
    </div>
  );
};

export default BasicInfoStep;
