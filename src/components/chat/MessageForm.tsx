
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Paperclip, Send, Smile } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import React from 'react';
import AttachmentPreview from './AttachmentPreview';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

export const messageFormSchema = z.object({
  content: z.string().max(1000, "Message is too long."),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

interface MessageFormProps {
    form: UseFormReturn<MessageFormValues>;
    onSubmit: (values: MessageFormValues) => void;
    isSending: boolean;
    attachment: File | null;
    onFileSelect: (file: File) => void;
    onRemoveAttachment: () => void;
    onTyping: () => void;
}

const MessageForm = ({ form, onSubmit, isSending, attachment, onFileSelect, onRemoveAttachment, onTyping }: MessageFormProps) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handlePaperclipClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
        if(event.target) {
            event.target.value = '';
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        form.setValue('content', form.getValues('content') + emojiData.emoji);
    };

    const disableSend = isSending || (!form.getValues("content").trim() && !attachment);

    return (
        <footer className="p-3 border-t bg-background shrink-0">
             {attachment && (
                <div className="px-1 pb-3">
                    <AttachmentPreview file={attachment} onRemove={onRemoveAttachment} />
                </div>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-3">
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <Button type="button" variant="ghost" size="icon" disabled={isSending} onClick={handlePaperclipClick}>
                        <Paperclip className="h-5 w-5"/>
                    </Button>
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input 
                                        placeholder="Type a message..." 
                                        {...field} 
                                        autoComplete="off" 
                                        disabled={isSending} 
                                        onChange={(e) => {
                                            field.onChange(e);
                                            onTyping();
                                        }}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" disabled={isSending}>
                                <Smile className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 mb-2 border-none" side="top" align="end">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </PopoverContent>
                    </Popover>
                    <Button type="submit" disabled={disableSend}>
                        <Send className="h-5 w-5"/>
                    </Button>
                </form>
            </Form>
        </footer>
    );
};

export default MessageForm;
