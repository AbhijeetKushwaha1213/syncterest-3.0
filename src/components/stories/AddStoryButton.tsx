
import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from '@tanstack/react-query';

const AddStoryButton = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        if (!user) {
            toast({
                title: 'Error',
                description: 'You must be logged in to add a story.',
                variant: 'destructive',
            });
            return;
        }

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        setIsUploading(true);

        try {
            const { error: uploadError } = await supabase.storage
                .from('stories')
                .upload(fileName, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('stories')
                .getPublicUrl(fileName);
            
            if (!publicUrl) {
                throw new Error("Could not get public URL for story image");
            }

            const { error: insertError } = await supabase.from('stories').insert({
                user_id: user.id,
                image_url: publicUrl,
            });

            if (insertError) {
                throw insertError;
            }

            toast({
                title: 'Success!',
                description: 'Your story has been added.',
            });
            queryClient.invalidateQueries({ queryKey: ['stories'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        } catch (error: any) {
            toast({
                title: 'Error uploading story',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center gap-1 shrink-0">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                disabled={isUploading}
            />
            <button
                onClick={handleClick}
                disabled={isUploading}
                className="flex items-center justify-center h-16 w-16 bg-muted border-2 border-dashed rounded-full cursor-pointer hover:bg-muted/80"
            >
                {isUploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                ) : (
                    <span className="text-3xl text-muted-foreground">+</span>
                )}
            </button>
            <p className="text-xs font-medium text-muted-foreground">Your Story</p>
        </div>
    );
};

export default AddStoryButton;
