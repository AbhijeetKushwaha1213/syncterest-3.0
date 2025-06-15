
import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { personalityTags as allPersonalityTags } from '@/data/personalityTags';
import type { ProfileWithDetails } from '@/api/profiles';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

interface EditProfileDialogProps {
  profile: ProfileWithDetails;
  children: React.ReactNode;
}

export const EditProfileDialog = ({ profile, children }: EditProfileDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [culturalPreferences, setCulturalPreferences] = useState({
    film: '',
    music: '',
    youtuber: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (profile) {
      setSelectedTags(profile.personality_tags || []);
      if (profile.cultural_preferences && typeof profile.cultural_preferences === 'object' && !Array.isArray(profile.cultural_preferences)) {
        const prefs = profile.cultural_preferences as any;
        setCulturalPreferences({
          film: prefs.film || '',
          music: prefs.music || '',
          youtuber: prefs.youtuber || '',
        });
      }
    }
  }, [profile]);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        personality_tags: selectedTags,
        cultural_preferences: culturalPreferences,
      })
      .eq('id', profile.id);

    setIsSaving(false);
    if (error) {
      toast({
        title: 'Error saving profile',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile updated!',
        description: 'Your changes have been saved successfully.',
      });
      await queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });
      setIsOpen(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div onClick={() => setIsOpen(true)}>{children}</div>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
            <DialogTitle>Edit Profile Details</DialogTitle>
            <DialogDescription>
                Update your personality and cultural tastes to improve your matches.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div>
                    <Label className="text-base font-semibold">Personality Tags</Label>
                    <p className="text-sm text-muted-foreground mb-4">Select tags that best describe you.</p>
                    <div className="flex flex-wrap gap-2">
                        {allPersonalityTags.map((tag) => (
                        <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
                            onClick={() => handleTagClick(tag)}
                            className="cursor-pointer transition-all"
                        >
                            {tag}
                        </Badge>
                        ))}
                    </div>
                </div>
                <div className="grid gap-4">
                    <div>
                        <Label htmlFor="film" className="text-base font-semibold">Favorite Film/Show</Label>
                        <Input id="film" value={culturalPreferences.film} onChange={(e) => setCulturalPreferences(p => ({...p, film: e.target.value}))} />
                    </div>
                    <div>
                        <Label htmlFor="music" className="text-base font-semibold">Favorite Music Artist</Label>
                        <Input id="music" value={culturalPreferences.music} onChange={(e) => setCulturalPreferences(p => ({...p, music: e.target.value}))} />
                    </div>
                    <div>
                        <Label htmlFor="youtuber" className="text-base font-semibold">Favorite Youtuber/Creator</Label>
                        <Input id="youtuber" value={culturalPreferences.youtuber} onChange={(e) => setCulturalPreferences(p => ({...p, youtuber: e.target.value}))} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};
