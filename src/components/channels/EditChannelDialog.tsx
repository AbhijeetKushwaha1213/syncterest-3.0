
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Channel } from '@/types';
import { useUpdateChannel } from '@/hooks/useUpdateChannel';

const formSchema = z.object({
  name: z.string().min(1, 'Channel name is required').max(50, 'Channel name is too long'),
  description: z.string().max(280, 'Description is too long').optional(),
});

type EditChannelFormValues = z.infer<typeof formSchema>;

interface EditChannelDialogProps {
  channel: Channel;
  children: React.ReactNode;
}

export const EditChannelDialog: React.FC<EditChannelDialogProps> = ({ channel, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { mutate: updateChannel, isPending } = useUpdateChannel(channel.id);

  const form = useForm<EditChannelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: channel.name || '',
      description: channel.description || '',
    },
  });

  const onSubmit = (values: EditChannelFormValues) => {
    updateChannel(values, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset(values);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Channel</DialogTitle>
          <DialogDescription>
            Make changes to your channel here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="general" {...field} />
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
                    <Textarea placeholder="A place to talk about anything and everything" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
