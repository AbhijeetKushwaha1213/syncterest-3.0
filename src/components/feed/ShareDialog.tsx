
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'post' | 'event' | 'reel';
  contentPreview: string;
}

interface Contact {
  id: string;
  other_participant: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    last_active_at: string;
  };
}

export const ShareDialog = ({ 
  isOpen, 
  onClose, 
  contentId, 
  contentType, 
  contentPreview 
}: ShareDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['user-contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase.rpc('get_conversations_for_user', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching contacts:', error);
        return [];
      }

      return data as Contact[];
    },
    enabled: !!user && isOpen,
  });

  const filteredContacts = contacts?.filter(contact =>
    contact.other_participant.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.other_participant.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleContactSelect = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleShare = async () => {
    if (selectedContacts.length === 0) {
      toast({
        variant: "destructive",
        title: "No contacts selected",
        description: "Please select at least one contact to share with.",
      });
      return;
    }

    setIsSharing(true);

    try {
      // Create conversations with selected contacts and send messages
      const sharePromises = selectedContacts.map(async (contactId) => {
        // Find or create conversation
        const { data: conversationId, error: convError } = await supabase.rpc(
          'find_or_create_conversation',
          { p_other_user_id: contactId }
        );

        if (convError) throw convError;

        // Send share message
        const shareContent = `${message ? message + '\n\n' : ''}🔗 Shared ${contentType}: ${contentPreview}`;
        
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user!.id,
            content: shareContent
          });

        if (messageError) throw messageError;
      });

      await Promise.all(sharePromises);

      toast({
        title: "Content shared successfully!",
        description: `Shared to ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}`,
      });

      onClose();
      setSelectedContacts([]);
      setMessage("");
    } catch (error) {
      console.error('Error sharing content:', error);
      toast({
        variant: "destructive",
        title: "Failed to share",
        description: "There was an error sharing the content. Please try again.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const isContactActive = (lastActiveAt: string) => {
    return new Date().getTime() - new Date(lastActiveAt).getTime() < 24 * 60 * 60 * 1000;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No contacts found
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.other_participant.id}
                  onClick={() => handleContactSelect(contact.other_participant.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedContacts.includes(contact.other_participant.id)
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.other_participant.avatar_url || ""} />
                    <AvatarFallback>
                      {contact.other_participant.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {contact.other_participant.full_name || contact.other_participant.username}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {isContactActive(contact.other_participant.last_active_at) && (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Active</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Input
            placeholder="Add a message (optional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleShare} 
              disabled={selectedContacts.length === 0 || isSharing}
              className="flex-1 gap-2"
            >
              <Send className="h-4 w-4" />
              Share ({selectedContacts.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
