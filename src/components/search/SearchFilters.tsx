import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type IntentOption = Tables<'intent_options'>;
type PersonalityTagOption = Tables<'personality_tags_options'>;

const fetchIntentOptions = async (): Promise<IntentOption[]> => {
  const { data, error } = await supabase.from('intent_options').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchPersonalityTags = async (): Promise<PersonalityTagOption[]> => {
  const { data, error } = await supabase.from('personality_tags_options').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

export interface SearchFiltersState {
    intent: string;
    personality_tags: string[];
    distance: number;
    sortBy: string;
}

interface SearchFiltersProps {
    filters: SearchFiltersState;
    onFiltersChange: (newFilters: Partial<SearchFiltersState>) => void;
}

const sortOptions = [
    { value: 'compatible', label: 'Most Compatible' },
    { value: 'distance', label: 'Closest Distance' },
    { value: 'recent', label: 'Recently Active' },
    { value: 'new', label: 'New Users' },
];

const SearchFilters = ({ filters, onFiltersChange }: SearchFiltersProps) => {
    const { data: intentOptions, isLoading: isLoadingIntents } = useQuery({ queryKey: ['intentOptions'], queryFn: fetchIntentOptions });
    const { data: personalityTags, isLoading: isLoadingTags } = useQuery({ queryKey: ['personalityTags'], queryFn: fetchPersonalityTags });

    const handleDistanceChange = (value: number[]) => {
        onFiltersChange({ distance: value[0] });
    };

    const handlePersonalityChange = (value: string[]) => {
        onFiltersChange({ personality_tags: value });
    };
    
    if (isLoadingIntents || isLoadingTags) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Filter & Sort</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filter & Sort</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="sort-by">Sort By</Label>
                    <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ sortBy: value })}>
                        <SelectTrigger id="sort-by">
                            <SelectValue placeholder="Sort results by..." />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="intent-filter">User Intent</Label>
                    <Select value={filters.intent} onValueChange={(value) => onFiltersChange({ intent: value })}>
                        <SelectTrigger id="intent-filter">
                            <SelectValue placeholder="What do you want to do?" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Intent</SelectItem>
                            {intentOptions?.map(option => (
                                <SelectItem key={option.id} value={option.name}>{option.description}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label>Personality Vibe</Label>
                    <ToggleGroup 
                        type="multiple" 
                        variant="outline" 
                        className="flex-wrap justify-start"
                        value={filters.personality_tags}
                        onValueChange={handlePersonalityChange}
                    >
                        {personalityTags?.map(tag => (
                            <ToggleGroupItem key={tag.id} value={tag.name} aria-label={tag.description || tag.name} className="h-auto text-wrap">
                                {tag.description}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="distance-slider">Distance ({filters.distance} km)</Label>
                    <Slider
                        id="distance-slider"
                        min={1}
                        max={100}
                        step={1}
                        value={[filters.distance]}
                        onValueChange={handleDistanceChange}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default SearchFilters;
