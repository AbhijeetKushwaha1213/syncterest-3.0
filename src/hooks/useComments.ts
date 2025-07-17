
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

export const useComments = (contentId: string, contentType: 'post' | 'event' | 'reel') => {
  const query = useQuery({
    queryKey: ['comments', contentType, contentId],
    queryFn: async () => {
      const columnName = `${contentType}_id`;
      
      // Use basic query with minimal select to avoid type issues
      const response = await supabase
        .from('comments' as any)
        .select('id, content, created_at, user_id')
        .eq(columnName, contentId)
        .order('created_at', { ascending: true });

      if (response.error) throw response.error;

      // Get profile data separately to avoid complex joins
      const comments: Comment[] = [];
      const commentData = response.data as any[] || [];

      for (const item of commentData) {
        // Get profile for each comment separately
        const profileResponse = await supabase
          .from('profiles' as any)
          .select('id, username, full_name, avatar_url')
          .eq('id', item.user_id)
          .single();

        // Handle profile response properly
        let profile: CommentProfile;
        if (profileResponse.error || !profileResponse.data) {
          profile = {
            id: item.user_id,
            username: null,
            full_name: null,
            avatar_url: null
          };
        } else {
          profile = {
            id: profileResponse.data.id || item.user_id,
            username: profileResponse.data.username || null,
            full_name: profileResponse.data.full_name || null,
            avatar_url: profileResponse.data.avatar_url || null
          };
        }

        comments.push({
          id: item.id,
          content: item.content,
          created_at: item.created_at,
          user_id: item.user_id,
          profiles: profile
        });
      }
      
      return comments;
    },
    enabled: !!contentId,
  });

  return {
    comments: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
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

      const commentData: Record<string, any> = {
        content,
        user_id: user.id,
      };
      
      // Set the appropriate ID field based on content type
      commentData[`${contentType}_id`] = contentId;

      // Use basic insert without complex select to avoid type issues
      const response = await supabase
        .from('comments' as any)
        .insert(commentData)
        .select('id, content, created_at, user_id')
        .single();

      if (response.error) throw response.error;
      
      // Handle response data properly
      if (!response.data) {
        throw new Error('Failed to create comment');
      }

      // Create comment object with profile data from user
      const comment: Comment = {
        id: response.data.id,
        content: response.data.content,
        created_at: response.data.created_at,
        user_id: response.data.user_id,
        profiles: {
          id: user.id,
          username: user.user_metadata?.username || null,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null
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
