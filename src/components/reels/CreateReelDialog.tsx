
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle } from "lucide-react";
import { TablesInsert } from "@/integrations/supabase/types";

const reelSchema = z.object({
  video_url: z.string().url({ message: "Please enter a valid video URL." }),
  caption: z.string().max(2200).optional(),
});

type ReelFormValues = z.infer<typeof reelSchema>;

const createReel = async (reel: TablesInsert<'reels'>) => {
  const { data, error } = await supabase.from("reels").insert(reel).select();
  if (error) throw error;
  return data;
};

const CreateReelDialog = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReelFormValues>({
    resolver: zodResolver(reelSchema),
    defaultValues: {
      video_url: "",
      caption: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createReel,
    onSuccess: () => {
      toast({
        title: "Reel created!",
        description: "Your new reel has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id, user?.id] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating reel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ReelFormValues) => {
    if (!user) {
      toast({ title: "Authentication error", description: "You must be logged in to create a reel.", variant: "destructive" });
      return;
    }
    mutation.mutate({
      user_id: user.id,
      video_url: values.video_url,
      caption: values.caption,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add Reel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new reel</DialogTitle>
          <DialogDescription>
            Share a new video with your followers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/video.mp4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write a caption..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create Reel"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReelDialog;
