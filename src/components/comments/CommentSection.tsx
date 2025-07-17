
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useComments, useCreateComment } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";

interface CommentSectionProps {
  contentId: string;
  contentType: 'post' | 'event' | 'reel';
}

const CommentSection = ({ contentId, contentType }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading } = useComments(contentId, contentType);
  const createCommentMutation = useCreateComment();
  const { profile } = useAuth();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    createCommentMutation.mutate({
      contentId,
      contentType,
      content: newComment.trim(),
    });
    setNewComment("");
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatar_url ?? ""} />
          <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={!newComment.trim() || createCommentMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.profiles.avatar_url ?? ""} />
              <AvatarFallback>
                {comment.profiles.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted rounded-lg p-3">
                <div className="font-semibold text-sm">
                  {comment.profiles.full_name || comment.profiles.username}
                </div>
                <div className="text-sm">{comment.content}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
