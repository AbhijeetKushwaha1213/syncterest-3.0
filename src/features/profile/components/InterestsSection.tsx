
import { useState } from "react";
import { ProfileWithDetails } from "@/api/profiles";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, X } from "lucide-react";
import { availableInterests } from "@/data/interests";

interface InterestsSectionProps {
  profile: ProfileWithDetails;
  isOwnProfile: boolean;
}

const updateInterests = async ({ userId, interests }: { userId: string, interests: string[] }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ interests })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const InterestsSection = ({ profile, isOwnProfile }: InterestsSectionProps) => {
  const [open, setOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.interests || []);
  const [inputValue, setInputValue] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: updateInterests,
    onSuccess: () => {
      toast({ title: "Interests updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id, user?.id] });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update interests",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (user) {
      mutation.mutate({ userId: user.id, interests: selectedInterests });
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };
  
  const filteredInterests = availableInterests.filter(interest => 
    !selectedInterests.includes(interest) && 
    interest.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="my-8">
      <h3 className="font-semibold text-lg text-center mb-4 uppercase text-muted-foreground tracking-wider">Interests</h3>
      <div className="flex flex-wrap gap-3 justify-center items-center">
        {profile.interests?.length > 0 ? profile.interests.map((interest) => (
          <div key={interest} className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-full">{interest}</div>
        )) : (
          !isOwnProfile && <p className="text-muted-foreground text-sm">No interests listed.</p>
        )}
        
        {isOwnProfile && (
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              setSelectedInterests(profile.interests || []);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <PlusCircle className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Interests</DialogTitle>
                <DialogDescription>
                  Select your interests. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-wrap gap-2 mb-4 p-2 border rounded-md min-h-[40px]">
                {selectedInterests.map(interest => (
                  <div key={interest} className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                    {interest}
                    <button onClick={() => toggleInterest(interest)} className="rounded-full hover:bg-muted/50">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Command>
                <CommandInput placeholder="Search or add an interest..." value={inputValue} onValueChange={setInputValue} />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {filteredInterests.map((interest) => (
                      <CommandItem
                        key={interest}
                        onSelect={() => {
                          toggleInterest(interest);
                          setInputValue("");
                        }}
                      >
                        {interest}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
