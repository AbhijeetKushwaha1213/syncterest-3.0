
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Users, Calendar, Activity, User } from 'lucide-react';
import type { GlobalSearchResult } from '@/hooks/useSearch';

const typeIcons: Record<GlobalSearchResult['type'], React.ReactNode> = {
  profile: <User className="h-4 w-4 text-muted-foreground" />,
  group: <Users className="h-4 w-4 text-muted-foreground" />,
  event: <Calendar className="h-4 w-4 text-muted-foreground" />,
  live_activity: <Activity className="h-4 w-4 text-muted-foreground" />,
};

const SearchResultItem = ({ result }: { result: GlobalSearchResult }) => {
  const { title, description, image_url, type, url_path } = result;

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <Link to={url_path} className="flex items-center gap-4 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={image_url ?? undefined} alt={title} />
          <AvatarFallback>{title.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">{title}</p>
          </div>
          <p className="text-sm text-muted-foreground truncate">{description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
            {typeIcons[type]}
            {type.replace('_', ' ')}
        </div>
      </Link>
    </Card>
  );
};

export default SearchResultItem;
