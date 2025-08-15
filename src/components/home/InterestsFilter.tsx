
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InterestsFilterProps {
  selectedInterest: string;
  onInterestChange: (interest: string) => void;
}

const InterestsFilter: React.FC<InterestsFilterProps> = ({ 
  selectedInterest, 
  onInterestChange 
}) => {
  const interests = [
    'All',
    'Sports',
    'Music',
    'Art',
    'Technology',
    'Food',
    'Travel',
    'Books',
    'Movies',
    'Fitness'
  ];

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-2 p-4">
        {interests.map((interest) => (
          <Badge
            key={interest}
            variant={selectedInterest === interest ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => onInterestChange(interest)}
          >
            {interest}
          </Badge>
        ))}
      </div>
    </ScrollArea>
  );
};

export default InterestsFilter;
