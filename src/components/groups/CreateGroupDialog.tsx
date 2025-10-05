import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, MapPin, Clock } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Group name must be at least 3 characters long.")
    .max(100, "Group name must be less than 100 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long.")
    .max(1000, "Description must be less than 1000 characters."),
  interest_tags: z
    .array(z.string())
    .min(1, "Please select at least one interest.")
    .max(10, "Please select no more than 10 interests."),
  location_name: z
    .string()
    .min(5, "Location must be at least 5 characters long.")
    .max(200, "Location must be less than 200 characters."),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  meeting_time: z
    .string()
    .min(5, "Meeting time must be at least 5 characters long.")
    .max(200, "Meeting time must be less than 200 characters."),
});

type FormValues = z.infer<typeof formSchema>;

const CreateGroupDialog = () => {
  const { user } = useAuth();
  const { latitude, longitude } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const availableTags = [
    "cycling", "running", "swimming", "fitness", "yoga", "meditation",
    "reading", "writing", "book club", "photography", "art", "music",
    "cooking", "baking", "food", "travel", "hiking", "nature",
    "tech", "programming", "gaming", "movies", "theater", "dance",
    "volunteering", "community", "environment", "animals", "pets"
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      interest_tags: [],
      location_name: "",
      latitude: latitude || 0,
      longitude: longitude || 0,
      meeting_time: "",
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user) throw new Error("You must be logged in to create a group.");

      const { error } = await supabase.from("groups").insert({
        name: values.name,
        description: values.description,
        interest_tags: values.interest_tags,
        location_name: values.location_name,
        latitude: values.latitude,
        longitude: values.longitude,
        meeting_time: values.meeting_time,
        created_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Group created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a local community group for people to discover and join.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              createGroupMutation.mutate(values)
            )}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Morning Cycling Club" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your group activities and purpose..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interest_tags"
              render={() => (
                <FormItem>
                  <FormLabel>Interests & Activities</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={tag}
                            checked={form.watch("interest_tags").includes(tag)}
                            onCheckedChange={(checked) => {
                              const currentTags = form.getValues("interest_tags");
                              if (checked) {
                                if (currentTags.length < 10) {
                                  form.setValue("interest_tags", [...currentTags, tag]);
                                }
                              } else {
                                form.setValue(
                                  "interest_tags",
                                  currentTags.filter((t) => t !== tag)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={tag}
                            className="text-sm font-medium leading-none"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Central Park, Delhi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meeting_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Meeting Time
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Every Saturday 7 AM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {latitude && longitude && (
              <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Using your current location for coordinates</span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createGroupMutation.isPending}>
                {createGroupMutation.isPending ? "Creating..." : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
