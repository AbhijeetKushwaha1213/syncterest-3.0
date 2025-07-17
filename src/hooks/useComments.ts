
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

interface CommentProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: CommentProfile;
}

export const useComments = (contentId: string, contentType: 'post' | 'event' | 'reel') => {
  const { user } = useAuth();
  
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', contentType, contentId],
    queryFn: async () => {
      const columnName = `${contentType}_id`;
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!inner (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq(columnName, contentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as unknown as Comment[];
    },
    enabled: !!contentId,
  });

  return { comments, isLoading };
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      contentId, 
      contentType, 
      content 
    }: { 
      contentId: string; 
      contentType: 'post' | 'event' | 'reel'; 
      content: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const commentData = {
        content,
        user_id: user.id,
        [`${contentType}_id`]: contentId,
      };

      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!inner (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data as unknown as Comment;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.contentType, variables.contentId]
      });
      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });
};
