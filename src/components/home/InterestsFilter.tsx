
import { Toggle } from "@/components/ui/toggle";
import {
  Flame, Dumbbell, Utensils, Palette, Music, CalendarDays, Gamepad2, Bike,
} from "lucide-react";

const interests = [
  { name: "Tech", icon: Flame },
  { name: "Fitness", icon: Dumbbell },
  { name: "Food", icon: Utensils },
  { name: "Art", icon: Palette },
  { name: "Music", icon: Music },
  { name: "Events", icon: CalendarDays },
  { name: "Games", icon: Gamepad2 },
  { name: "Sports", icon: Bike },
];

interface InterestsFilterProps {
  selectedInterest: string | null;
  onInterestClick: (interest: string) => void;
}

const InterestsFilter = ({ selectedInterest, onInterestClick }: InterestsFilterProps) => {
  return (
    <div className="space-y-3 px-4 md:px-0">
      <h2 className="text-lg font-semibold">Interests</h2>
      <div className="flex flex-wrap gap-2">
        {interests.map(interest => (
          <Toggle
            key={interest.name}
            pressed={selectedInterest === interest.name}
            onPressedChange={() => onInterestClick(interest.name)}
            variant="outline"
            className="gap-2 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-muted/80 data-[state=on]:border-primary"
          >
            <interest.icon className="h-4 w-4" />
            {interest.name}
          </Toggle>
        ))}
      </div>
    </div>
  );
};

export default InterestsFilter;
