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

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const SUPPORTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const reelSchema = z.object({
  video: z
    .instanceof(File, { message: "A video is required." })
    .refine((file) => file.size > 0, "A video is required.")
    .refine((file) => file.size <= MAX_VIDEO_SIZE, `Max video size is 50MB.`)
    .refine(
      (file) => SUPPORTED_VIDEO_TYPES.includes(file.type),
      "Only .mp4, .webm, and .mov formats are supported."
    ),
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
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReelFormValues>({
    resolver: zodResolver(reelSchema),
    defaultValues: {
      video: undefined,
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

  const onSubmit = async (values: ReelFormValues) => {
    if (!user) {
      toast({ title: "Authentication error", description: "You must be logged in to create a reel.", variant: "destructive" });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const file = values.video;
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("reels")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("reels")
        .getPublicUrl(filePath);

      mutation.mutate({
        user_id: user.id,
        video_url: publicUrl,
        caption: values.caption,
      });

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload the video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
              name="video"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Video</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={SUPPORTED_VIDEO_TYPES.join(",")}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          onChange(e.target.files[0]);
                        }
                      }}
                      {...rest}
                    />
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
              <Button type="submit" disabled={isUploading || mutation.isPending}>
                {isUploading ? "Uploading..." : mutation.isPending ? "Creating..." : "Create Reel"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReelDialog;
