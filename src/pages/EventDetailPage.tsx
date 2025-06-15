
import { useParams } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvent';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, Image } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

const EventDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { data: event, isLoading: isLoadingEvent } = useEvent(id);
    const { data: creatorProfile, isLoading: isLoadingCreator } = useProfile(event?.created_by);

    const isLoading = isLoadingEvent || (event && isLoadingCreator);

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-3xl py-8">
                <Skeleton className="h-80 w-full rounded-lg mb-6" />
                <Skeleton className="h-12 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        );
    }

    if (!event) {
        return <div className="text-center py-10">Event not found.</div>;
    }

    return (
        <div className="container mx-auto max-w-3xl py-8">
            {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-full h-80 object-cover rounded-lg mb-6" />
            ) : (
                <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center mb-6">
                    <Image className="h-32 w-32 text-muted-foreground" />
                </div>
            )}
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-4xl font-bold tracking-tight">{event.title}</CardTitle>
                    <CardDescription className="pt-2 text-lg">{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <Calendar className="h-5 w-5" />
                        <span className="text-lg">{format(new Date(event.event_time), "PPPP")}</span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <Clock className="h-5 w-5" />
                        <span className="text-lg">{format(new Date(event.event_time), "p")}</span>
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <MapPin className="h-5 w-5" />
                            <span className="text-lg">{event.location}</span>
                        </div>
                    )}
                    {creatorProfile && (
                        <div className="pt-4">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Created by</h3>
                             <Link to={`/profile/${creatorProfile.id}`} className="flex items-center gap-3 w-fit">
                                <Avatar>
                                    <AvatarImage src={creatorProfile.avatar_url ?? ""} />
                                    <AvatarFallback>{creatorProfile.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{creatorProfile.username}</p>
                                    <p className="text-xs text-muted-foreground">{creatorProfile.full_name}</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EventDetailPage;
