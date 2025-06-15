
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendChannelMessage } from '@/api/channelChat';

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty.").max(1000, "Message is too long."),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface ChannelMessageFormProps {
  channelId: string;
  channelName: string;
}

const ChannelMessageForm = ({ channelId, channelName }: ChannelMessageFormProps) => {
  const { toast } = useToast();
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (values: MessageFormValues) => sendChannelMessage({ channelId, content: values.content }),
    onSuccess: () => {
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message,
      });
    },
  });

  const onSubmit = (values: MessageFormValues) => {
    sendMessageMutation.mutate(values);
  };

  return (
    <div className="p-4 border-t bg-background shrink-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-3">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder={`Message #${channelName}`}
                    {...field}
                    autoComplete="off"
                    disabled={sendMessageMutation.isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={sendMessageMutation.isPending || !form.formState.isValid}>
            <Send className="h-5 w-5"/>
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ChannelMessageForm;
