
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Paperclip, Send } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export const messageFormSchema = z.object({
  content: z.string().min(1, "Message cannot be empty.").max(1000, "Message is too long."),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

interface MessageFormProps {
    form: UseFormReturn<MessageFormValues>;
    onSubmit: (values: MessageFormValues) => void;
    isSending: boolean;
}

const MessageForm = ({ form, onSubmit, isSending }: MessageFormProps) => {
    return (
        <footer className="p-3 border-t bg-background shrink-0">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-3">
                    <Button type="button" variant="ghost" size="icon" disabled={isSending}><Paperclip className="h-5 w-5"/></Button>
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input placeholder="Type a message..." {...field} autoComplete="off" disabled={isSending} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSending}>
                        <Send className="h-5 w-5"/>
                    </Button>
                </form>
            </Form>
        </footer>
    );
};

export default MessageForm;
