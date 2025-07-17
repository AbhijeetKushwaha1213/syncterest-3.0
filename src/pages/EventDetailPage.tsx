
import { useParams } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvent';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, Image } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import EventMap from '@/components/events/EventMap';

const EventDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { data: event, isLoading: isLoadingEvent } = useEvent(id);
    const { data: creatorProfile, isLoading: isLoadingCreator } = useProfile(event?.created_by);

    const isLoading = isLoadingEvent || (event && isLoadingCreator);

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl py-8">
                <Skeleton className="h-80 w-full rounded-lg mb-6" />
                <Skeleton className="h-12 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (!event) {
        return <div className="text-center py-10">Event not found.</div>;
    }

    const hasLocation = event.latitude && event.longitude;

    return (
        <div className="container mx-auto max-w-4xl py-8">
            {/* Hero Image */}
            {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-full h-80 object-cover rounded-lg mb-6" />
            ) : (
                <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center mb-6">
                    <Image className="h-32 w-32 text-muted-foreground" />
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Event Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold tracking-tight">{event.title}</CardTitle>
                        <CardDescription className="text-lg">{event.description}</CardDescription>
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

                {/* Right Column - Map */}
                <div className="space-y-4">
                    {hasLocation ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Event Location</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <EventMap
                                    latitude={event.latitude!}
                                    longitude={event.longitude!}
                                    title={event.title}
                                    address={event.location || undefined}
                                    className="h-64"
                                />
                                {event.location && (
                                    <p className="text-sm text-muted-foreground mt-2 text-center">
                                        {event.location}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ) : event.location ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Event Location</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span>{event.location}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;
