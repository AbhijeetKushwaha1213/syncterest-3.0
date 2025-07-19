
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Users, Tag, Plus, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useLocation } from '@/hooks/useLocation';
import { useLiveActivities } from '@/hooks/useLiveActivities';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ACTIVITY_OPTIONS = [
  { value: 'playing_cricket', label: 'Playing Cricket', emoji: '🏏' },
  { value: 'coding', label: 'Coding', emoji: '💻' },
  { value: 'studying', label: 'Studying', emoji: '📚' },
  { value: 'gaming', label: 'Gaming', emoji: '🎮' },
  { value: 'reading', label: 'Reading', emoji: '📖' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'coffee', label: 'Getting Coffee', emoji: '☕' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'workout', label: 'Working Out', emoji: '💪' },
  { value: 'music', label: 'Making Music', emoji: '🎵' },
  { value: 'art', label: 'Creating Art', emoji: '🎨' },
  { value: 'cooking', label: 'Cooking', emoji: '👨‍🍳' },
  { value: 'other', label: 'Other', emoji: '✨' }
];

const TAG_OPTIONS = [
  'Coding', 'Cricket', 'Football', 'Basketball', 'Study', 'Gaming', 
  'Music', 'Art', 'Food', 'Fitness', 'Reading', 'Travel', 'Tech', 
  'Business', 'Photography', 'Dance', 'Yoga', 'Coffee'
];

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public - Anyone can see' },
  { value: 'mutual_interests', label: 'Mutual Interests - People with similar interests' },
  { value: 'friends', label: 'Friends - Only my connections' },
  { value: 'invite_only', label: 'Invite Only - I choose who joins' }
];

export default function LiveStatusForm() {
  const [activity, setActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isNow, setIsNow] = useState(false);
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [newTag, setNewTag] = useState('');
  
  const { getLocation } = useLocation();
  const { upsertActivity, isUpserting } = useLiveActivities();
  const { toast } = useToast();

  const handleNowToggle = (checked: boolean) => {
    setIsNow(checked);
    if (checked) {
      const now = new Date();
      const later = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      setStartTime(format(now, "yyyy-MM-dd'T'HH:mm"));
      setEndTime(format(later, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  const handleUseCurrentLocation = async () => {
    const coords = await getLocation();
    if (coords) {
      // For now, we'll use coordinates as location text
      // In a real app, you'd reverse geocode to get address
      setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      toast({
        title: "Location captured!",
        description: "Your current location has been added."
      });
    }
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addPredefinedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const activityName = activity === 'other' ? customActivity : 
      ACTIVITY_OPTIONS.find(opt => opt.value === activity)?.label || activity;

    if (!activityName || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in activity, start time, and end time.",
        variant: "destructive"
      });
      return;
    }

    try {
      const coords = await getLocation();
      
      upsertActivity({
        activity_type: activityName,
        custom_message: description || location,
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
        expires_at: new Date(endTime).toISOString(),
        user_id: '' // This will be set by the mutation
      });

      // Reset form
      setActivity('');
      setCustomActivity('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setTags([]);
      setDescription('');
      setIsNow(false);

      toast({
        title: "Live Status Posted!",
        description: "Your activity is now visible to others."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post your live status. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          Post Live Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Selection */}
          <div className="space-y-2">
            <Label htmlFor="activity">What are you doing? *</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Select an activity..." />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span>{option.emoji}</span>
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activity === 'other' && (
              <Input
                placeholder="Describe your activity..."
                value={customActivity}
                onChange={(e) => setCustomActivity(e.target.value)}
              />
            )}
          </div>

          {/* Time Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Time</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isNow}
                  onCheckedChange={handleNowToggle}
                />
                <Label className="text-sm">I'm doing it now</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter location or address..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleUseCurrentLocation}
                className="shrink-0"
              >
                <MapPin className="w-4 h-4 mr-1" />
                Use Current
              </Button>
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <Label>Who can join?</Label>
            <Select value={privacy} onValueChange={setPrivacy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIVACY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addPredefinedTag(tag)}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  disabled={tags.includes(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional Notes</Label>
            <Textarea
              placeholder="Add more context about your activity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isUpserting}
            size="lg"
          >
            {isUpserting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Posting...
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2" />
                Post Live Status
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
