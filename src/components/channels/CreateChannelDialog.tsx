
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Constants, Enums } from '@/integrations/supabase/types';
import { Plus } from 'lucide-react';

const channelSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().optional(),
  genre: z.custom<Enums<'channel_genre'>>(),
  visibility: z.custom<Enums<'channel_visibility'>>(),
});

type ChannelFormValues = z.infer<typeof channelSchema>;

interface CreateChannelDialogProps {
  children: React.ReactNode;
}

export const CreateChannelDialog = ({ children }: CreateChannelDialogProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: '',
      description: '',
      genre: 'general',
      visibility: 'public',
    },
  });

  const createChannelMutation = useMutation({
    mutationFn: async (values: ChannelFormValues) => {
      if (!user) throw new Error("You must be logged in to create a channel.");
      const { data, error } = await supabase
        .from('channels')
        .insert({ ...values, creator_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Channel created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['joined-channels'] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create channel',
        description: error.message,
      });
    },
  });

  const onSubmit = (values: ChannelFormValues) => {
    createChannelMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new channel</DialogTitle>
          <DialogDescription>
            Give your community a home. You can change these details later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Weekend Warriors" {...field} />
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
                    <Textarea placeholder="What is this channel about?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a genre" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Constants.public.Enums.channel_genre.map(genre => (
                          <SelectItem key={genre} value={genre} className="capitalize">{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select visibility" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Constants.public.Enums.channel_visibility.map(visibility => (
                          <SelectItem key={visibility} value={visibility} className="capitalize">{visibility}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createChannelMutation.isPending}>
                {createChannelMutation.isPending ? 'Creating...' : 'Create Channel'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
