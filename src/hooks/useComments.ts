
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

// Simple, explicit type definitions to avoid circular references
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
    queryFn: async (): Promise<Comment[]> => {
      const columnName = `${contentType}_id`;
      
      // Use a simpler query to avoid type inference issues
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq(columnName, contentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Cast to any first to break type chain, then map to our types
      const rawData = data as any[];
      
      return (rawData || []).map((item: any): Comment => ({
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
    }): Promise<Comment> => {
      if (!user) throw new Error('User not authenticated');

      const commentData = {
        content,
        user_id: user.id,
        [`${contentType}_id`]: contentId,
      };

      // Use simpler query to avoid type inference issues
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select('*, profiles(*)')
        .single();

      if (error) throw error;
      
      // Cast to any first to break type chain, then map to our type
      const rawData = data as any;
      
      return {
        id: rawData.id,
        content: rawData.content,
        created_at: rawData.created_at,
        user_id: rawData.user_id,
        profiles: {
          id: rawData.profiles?.id || '',
          username: rawData.profiles?.username || null,
          full_name: rawData.profiles?.full_name || null,
          avatar_url: rawData.profiles?.avatar_url || null
        }
      };
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
