
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import EventImageUpload from "./EventImageUpload";
import EventMapSelector from "./EventMapSelector";
import TimeSelector from "./TimeSelector";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  event_date: z.date({ required_error: "Event date is required." }),
  event_time: z.string().min(1, "Event time is required"),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  image_file: z.instanceof(File).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

type NewEventPayload = {
  title: string;
  description?: string;
  location?: string;
  event_time: string;
  created_by: string;
  image_url: string | null;
  latitude?: number;
  longitude?: number;
};

const CreateEventDialog = () => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      event_time: "18:00", // Default to 6 PM
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (newEvent: NewEventPayload) => {
      const { data, error } = await supabase.from("events").insert(newEvent).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Event created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    if (!user) {
      toast({ title: "You must be logged in to create an event.", variant: "destructive" });
      return;
    }

    let imageUrl: string | null = null;
    if (values.image_file) {
      setIsUploading(true);
      const file = values.image_file;
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      } catch (error: any) {
        toast({
          title: "Error uploading image",
          description: error.message,
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    // Combine date and time
    const eventDateTime = new Date(values.event_date);
    const [hours, minutes] = values.event_time.split(':').map(Number);
    eventDateTime.setHours(hours, minutes, 0, 0);
    
    createEventMutation.mutate({
      title: values.title,
      description: values.description,
      location: values.location,
      event_time: eventDateTime.toISOString(),
      created_by: user.id,
      image_url: imageUrl,
      latitude: values.latitude,
      longitude: values.longitude,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new event.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Image Upload */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="image_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <EventImageUpload
                          onImageChange={(file) => field.onChange(file)}
                          currentImage={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Map Selector */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <EventMapSelector
                          onLocationChange={(location) => {
                            if (location) {
                              field.onChange(location.address);
                              form.setValue("latitude", location.latitude);
                              form.setValue("longitude", location.longitude);
                            } else {
                              field.onChange("");
                              form.setValue("latitude", undefined);
                              form.setValue("longitude", undefined);
                            }
                          }}
                          initialLocation={
                            field.value && form.getValues("latitude") && form.getValues("longitude")
                              ? {
                                  address: field.value,
                                  latitude: form.getValues("latitude")!,
                                  longitude: form.getValues("longitude")!,
                                }
                              : undefined
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title..." {...field} />
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
                          placeholder="Describe your event..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date and Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="event_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Event Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="event_time"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Event Time</FormLabel>
                        <FormControl>
                          <TimeSelector
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={createEventMutation.isPending || isUploading}
                className="w-full sm:w-auto"
              >
                {isUploading ? 'Uploading...' : createEventMutation.isPending ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
