import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Calendar, Video, Image } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SharedContentPreviewProps {
  contentType: 'post' | 'event' | 'reel';
  contentId: string;
}

interface PostData {
  id: string;
  caption?: string;
  image_url?: string;
  created_at: string;
}

interface EventData {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

interface ReelData {
  id: string;
  caption?: string;
  video_url?: string;
  created_at: string;
}

type ContentData = PostData | EventData | ReelData;

const SharedContentPreview = ({ contentType, contentId }: SharedContentPreviewProps) => {
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContentData();
  }, [contentType, contentId]);

  const fetchContentData = async () => {
    try {
      let data = null;
      let error = null;

      switch (contentType) {
        case 'post':
          const postResult = await supabase
            .from('posts')
            .select('id, caption, image_url, created_at')
            .eq('id', contentId)
            .single();
          data = postResult.data;
          error = postResult.error;
          break;
        case 'event':
          const eventResult = await supabase
            .from('events')
            .select('id, title, description, image_url, created_at')
            .eq('id', contentId)
            .single();
          data = eventResult.data;
          error = eventResult.error;
          break;
        case 'reel':
          const reelResult = await supabase
            .from('reels')
            .select('id, caption, video_url, created_at')
            .eq('id', contentId)
            .single();
          data = reelResult.data;
          error = reelResult.error;
          break;
        default:
          return;
      }

      if (error) {
        console.error('Error fetching shared content:', error);
        return;
      }

      if (data) {
        setContentData(data);
      }
    } catch (error) {
      console.error('Error fetching shared content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewContent = () => {
    // Navigate within the same app instead of opening new tabs
    if (contentType === 'event') {
      navigate(`/events/${contentId}`);
    } else {
      // For posts and reels, navigate to the home feed where they can be viewed
      navigate('/home');
    }
  };

  if (loading) {
    return (
      <Card className="max-w-sm">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full mb-3" />
          <Skeleton className="h-8 w-20" />
        </CardContent>
      </Card>
    );
  }

  if (!contentData) {
    return (
      <Card className="max-w-sm border-destructive/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Content not available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIcon = () => {
    switch (contentType) {
      case 'post':
        return (contentData as PostData).image_url ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />;
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'reel':
        return <Video className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (contentType) {
      case 'post':
        return (contentData as PostData).caption || 'Shared post';
      case 'event':
        return (contentData as EventData).title || 'Shared event';
      case 'reel':
        return (contentData as ReelData).caption || 'Shared reel';
      default:
        return `Shared ${contentType}`;
    }
  };

  const getDescription = () => {
    let desc = '';
    switch (contentType) {
      case 'post':
        desc = (contentData as PostData).caption || '';
        break;
      case 'event':
        desc = (contentData as EventData).description || '';
        break;
      case 'reel':
        desc = (contentData as ReelData).caption || '';
        break;
    }
    return desc.length > 100 ? desc.substring(0, 100) + '...' : desc;
  };

  return (
    <Card className="max-w-sm hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleViewContent}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-primary mt-1">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm mb-1 truncate">{getTitle()}</h4>
            {getDescription() && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {getDescription()}
              </p>
            )}
            <Button size="sm" variant="outline" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              View {contentType}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SharedContentPreview;
