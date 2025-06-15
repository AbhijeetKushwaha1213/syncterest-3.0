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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const postSchema = z.object({
  image: z
    .instanceof(File, { message: "An image is required." })
    .refine((file) => file.size > 0, "An image is required.")
    .refine((file) => file.size <= MAX_IMAGE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => SUPPORTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, .gif and .webp formats are supported."
    ),
  caption: z.string().max(2200).optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

const createPost = async (post: TablesInsert<'posts'>) => {
  const { data, error } = await supabase.from("posts").insert(post).select();
  if (error) throw error;
  return data;
};

const CreatePostDialog = () => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      image: undefined,
      caption: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      toast({
        title: "Post created!",
        description: "Your new post has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id, user?.id] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: PostFormValues) => {
    if (!user) {
      toast({ title: "Authentication error", description: "You must be logged in to create a post.", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      const file = values.image;
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("posts")
        .getPublicUrl(filePath);

      mutation.mutate({
        user_id: user.id,
        image_url: publicUrl,
        caption: values.caption,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload the image. Please try again.",
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
          Add Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
          <DialogDescription>
            Share a new photo with your followers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={SUPPORTED_IMAGE_TYPES.join(",")}
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
                {isUploading ? "Uploading..." : mutation.isPending ? "Creating..." : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
