
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

// Completely isolated type definitions to avoid Supabase type inference issues
type CommentProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: CommentProfile;
};

export const useComments = (contentType: 'post' | 'event' | 'reel', contentId: string) => {
  return useQuery({
    queryKey: ['comments', contentType, contentId],
    queryFn: async () => {
      const columnName = `${contentType}_id`;
      
      // Use completely raw query to avoid any type inference
      const { data, error } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id, profiles(id, username, full_name, avatar_url)')
        .eq(columnName, contentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Direct casting to bypass all type checking
      const comments: Comment[] = (data || []).map((item: any) => ({
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        user_id: item.user_id,
        profiles: {
          id: item.profiles?.id || '',
          username: item.profiles?.username || null,
          full_name: item.profiles?.full_name || null,
          avatar_url: item.profiles?.avatar_url || null
        }
      }));
      
      return comments;
    },
    enabled: !!contentId,
  });
};

export const useCreateComment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      content, 
      contentType, 
      contentId 
    }: { 
      content: string;
      contentType: 'post' | 'event' | 'reel';
      contentId: string;
    }) => {
      if (!user) {
        throw new Error('You must be logged in to comment');
      }

      const commentData = {
        content,
        user_id: user.id,
        [`${contentType}_id`]: contentId,
      };

      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select('id, content, created_at, user_id, profiles(id, username, full_name, avatar_url)')
        .single();

      if (error) throw error;
      
      // Direct casting to avoid type issues
      const comment: Comment = {
        id: (data as any).id,
        content: (data as any).content,
        created_at: (data as any).created_at,
        user_id: (data as any).user_id,
        profiles: {
          id: (data as any).profiles?.id || '',
          username: (data as any).profiles?.username || null,
          full_name: (data as any).profiles?.full_name || null,
          avatar_url: (data as any).profiles?.avatar_url || null
        }
      };
      
      return comment;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', variables.contentType, variables.contentId] 
      });
      toast({ title: "Comment added successfully!" });
    },
    onError: (error) => {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export type { Comment, CommentProfile };
