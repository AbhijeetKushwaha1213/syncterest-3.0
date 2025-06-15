
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload } from 'lucide-react';

interface AvatarUploaderProps {
  initialAvatarUrl: string | null | undefined;
  username: string | null | undefined;
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const SUPPORTED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/gif"];

const AvatarUploader = ({ initialAvatarUrl, username }: AvatarUploaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    if (!user) {
      toast({ title: 'You must be logged in to upload an avatar.', variant: 'destructive' });
      return;
    }

    const file = event.target.files[0];

    if (file.size > MAX_AVATAR_SIZE) {
      toast({ title: 'File too large', description: 'Avatar image must be less than 2MB.', variant: 'destructive' });
      return;
    }

    if (!SUPPORTED_AVATAR_TYPES.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please select a PNG, JPG, or GIF image.', variant: 'destructive' });
      return;
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    setIsUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (updateError) throw updateError;

      toast({
        title: 'Avatar updated!',
        description: 'Your new profile picture has been saved.',
      });
      
      window.location.reload();

    } catch (error: any) {
      toast({
        title: 'Error uploading avatar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatarUrl ?? ""} alt="Avatar" />
        <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <Button asChild variant="outline">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {isUploading ? 'Uploading...' : 'Upload new picture'}
          </label>
        </Button>
        <Input id="avatar-upload" type="file" className="hidden" onChange={handleFileChange} accept={SUPPORTED_AVATAR_TYPES.join(",")} disabled={isUploading} />
        <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 2MB.</p>
      </div>
    </div>
  );
};

export default AvatarUploader;
