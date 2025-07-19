
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, MapPin, Clock, Tag, X } from 'lucide-react';

const ACTIVITY_FILTERS = [
  'All Activities', 'Coding', 'Sports', 'Study', 'Gaming', 'Music', 'Food', 'Fitness'
];

const TIME_FILTERS = [
  { value: 'all', label: 'Any Time' },
  { value: 'now', label: 'Happening Now' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This Week' }
];

const DISTANCE_FILTERS = [
  { value: 'all', label: 'Any Distance' },
  { value: '1', label: 'Within 1km' },
  { value: '5', label: 'Within 5km' },
  { value: '10', label: 'Within 10km' },
  { value: '50', label: 'Within 50km' }
];

interface LiveActivityFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedActivity: string;
  onActivityChange: (activity: string) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  selectedDistance: string;
  onDistanceChange: (distance: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function LiveActivityFilters({
  searchTerm,
  onSearchChange,
  selectedActivity,
  onActivityChange,
  selectedTime,
  onTimeChange,
  selectedDistance,
  onDistanceChange,
  selectedTags,
  onTagsChange
}: LiveActivityFiltersProps) {
  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onActivityChange('All Activities');
    onTimeChange('all');
    onDistanceChange('all');
    onTagsChange([]);
  };

  const hasActiveFilters = searchTerm || selectedActivity !== 'All Activities' || 
    selectedTime !== 'all' || selectedDistance !== 'all' || selectedTags.length > 0;

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search activities, locations, or people..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Activity Filter */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Filter className="w-3 h-3" />
              Activity
            </div>
            <Select value={selectedActivity} onValueChange={onActivityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_FILTERS.map((activity) => (
                  <SelectItem key={activity} value={activity}>
                    {activity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Filter */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Clock className="w-3 h-3" />
              Time
            </div>
            <Select value={selectedTime} onValueChange={onTimeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_FILTERS.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distance Filter */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <MapPin className="w-3 h-3" />
              Distance
            </div>
            <Select value={selectedDistance} onValueChange={onDistanceChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISTANCE_FILTERS.map((distance) => (
                  <SelectItem key={distance.value} value={distance.value}>
                    {distance.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className="w-full"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Active Tags */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Tag className="w-3 h-3" />
              Active Filters
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
