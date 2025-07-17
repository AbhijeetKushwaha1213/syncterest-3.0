
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Paperclip, Send, Smile, Mic, Camera } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import React, { useState } from 'react';
import AttachmentPreview from '@/components/chat/AttachmentPreview';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AudioRecorder from './AudioRecorder';
import CameraCapture from './CameraCapture';

export const channelMessageFormSchema = z.object({
  content: z.string().max(1000, "Message is too long."),
});

type MessageFormValues = z.infer<typeof channelMessageFormSchema>;

interface ChannelMessageFormProps {
    form: UseFormReturn<MessageFormValues>;
    onSubmit: (values: MessageFormValues) => void;
    isSending: boolean;
    attachment: File | null;
    onFileSelect: (file: File) => void;
    onRemoveAttachment: () => void;
    onTyping: () => void;
    onAudioRecorded?: (audioBlob: Blob) => void;
    onImageCaptured?: (imageBlob: Blob) => void;
}

const ChannelMessageForm = ({ 
    form, 
    onSubmit, 
    isSending, 
    attachment, 
    onFileSelect, 
    onRemoveAttachment, 
    onTyping,
    onAudioRecorded,
    onImageCaptured
}: ChannelMessageFormProps) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [showAudioRecorder, setShowAudioRecorder] = useState(false);
    const [showCameraCapture, setShowCameraCapture] = useState(false);

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

    const handleAudioRecorded = (audioBlob: Blob) => {
        if (onAudioRecorded) {
            onAudioRecorded(audioBlob);
        }
    };

    const handleImageCaptured = (imageBlob: Blob) => {
        if (onImageCaptured) {
            onImageCaptured(imageBlob);
        }
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
                <TooltipProvider>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-1">
                        <Input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" disabled={isSending} onClick={handlePaperclipClick}>
                                    <Paperclip className="h-5 w-5"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Attach file</p></TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    disabled={isSending}
                                    onClick={() => setShowAudioRecorder(true)}
                                >
                                    <Mic className="h-5 w-5"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Record audio</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    disabled={isSending}
                                    onClick={() => setShowCameraCapture(true)}
                                >
                                    <Camera className="h-5 w-5"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Capture image</p></TooltipContent>
                        </Tooltip>

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input 
                                            placeholder="Message in channel..." 
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
                </TooltipProvider>
            </Form>

            <AudioRecorder
                isOpen={showAudioRecorder}
                onClose={() => setShowAudioRecorder(false)}
                onRecordingComplete={handleAudioRecorded}
            />

            <CameraCapture
                isOpen={showCameraCapture}
                onClose={() => setShowCameraCapture(false)}
                onCapture={handleImageCaptured}
            />
        </footer>
    );
};

export default ChannelMessageForm;
