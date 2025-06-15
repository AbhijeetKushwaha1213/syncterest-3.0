
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Users, Calendar, Activity, User, Heart } from 'lucide-react';
import type { GlobalSearchResult } from '@/hooks/useSearch';
import { Badge } from '@/components/ui/badge';

const typeIcons: Record<GlobalSearchResult['type'], React.ReactNode> = {
  profile: <User className="h-4 w-4 text-muted-foreground" />,
  group: <Users className="h-4 w-4 text-muted-foreground" />,
  event: <Calendar className="h-4 w-4 text-muted-foreground" />,
  live_activity: <Activity className="h-4 w-4 text-muted-foreground" />,
};

const SearchResultItem = ({ result, compatibilityScore, showCompatibility }: { result: GlobalSearchResult, compatibilityScore?: number | null, showCompatibility?: boolean }) => {
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
        {showCompatibility && typeof compatibilityScore === 'number' && (
          <Badge variant="destructive" className="flex items-center gap-1 mr-2 flex-shrink-0">
            <Heart className="h-3 w-3" />
            {Math.round(compatibilityScore * 100)}%
          </Badge>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
            {typeIcons[type]}
            {type.replace('_', ' ')}
        </div>
      </Link>
    </Card>
  );
};

export default SearchResultItem;
