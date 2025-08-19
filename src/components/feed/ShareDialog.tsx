import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Search, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  last_active_at: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  contentType: 'post' | 'event' | 'reel';
  isForward?: boolean;
}

const ShareDialog = ({ open, onOpenChange, contentId, contentType, isForward = false }: ShareDialogProps) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchContacts();
    }
  }, [open, user]);

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [contacts, searchTerm]);

  const fetchContacts = async () => {
    try {
      // Get conversation participants (contacts)
      const { data: conversationData } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          user_id,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            last_active_at
          )
        `)
        .neq('user_id', user?.id);

      if (conversationData) {
        const uniqueContacts = conversationData
          .filter(item => item.profiles)
          .map(item => item.profiles)
          .filter((contact, index, self) => 
            index === self.findIndex(c => c?.id === contact?.id)
          ) as Contact[];

        setContacts(uniqueContacts);
        setFilteredContacts(uniqueContacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleContactToggle = (contactId: string) => {
    if (isForward) {
      setSelectedContacts(prev => 
        prev.includes(contactId) 
          ? prev.filter(id => id !== contactId)
          : [...prev, contactId]
      );
    } else {
      // For sharing, directly share to this contact
      handleShare([contactId]);
    }
  };

  const handleShare = async (contactIds: string[]) => {
    if (contactIds.length === 0) return;
    
    setLoading(true);
    try {
      for (const contactId of contactIds) {
        // Find or create conversation
        const { data: conversationId } = await supabase.rpc(
          'find_or_create_conversation',
          { p_other_user_id: contactId }
        );

        if (conversationId) {
          // Create a proper shareable message format
          const shareMessage = message || `Check out this ${contentType}!`;
          
          await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              sender_id: user?.id,
              content: `${shareMessage}\n\n🔗 SHARED_CONTENT:${contentType}:${contentId}`
            });
        }
      }

      toast({
        title: "Content shared successfully!",
        description: `Shared to ${contactIds.length} contact${contactIds.length > 1 ? 's' : ''}`,
      });

      onOpenChange(false);
      setSelectedContacts([]);
      setMessage("");
    } catch (error) {
      console.error('Error sharing content:', error);
      toast({
        title: "Error sharing content",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isContactOnline = (lastActiveAt: string) => {
    return new Date(lastActiveAt) > new Date(Date.now() - 10 * 60 * 1000); // 10 minutes
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isForward ? 'Forward' : 'Share'} {contentType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedContacts.includes(contact.id)
                    ? 'bg-primary/10 border border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleContactToggle(contact.id)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatar_url} />
                    <AvatarFallback>
                      {(contact.full_name || contact.username || 'U').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isContactOnline(contact.last_active_at) && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {contact.full_name || contact.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isContactOnline(contact.last_active_at) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {isForward && (
            <>
              <Textarea
                placeholder="Add a message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
              
              <Button
                onClick={() => handleShare(selectedContacts)}
                disabled={selectedContacts.length === 0 || loading}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Forward to {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
