
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

type Event = Database['public']['Tables']['events']['Row'];

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Card className="flex flex-col">
      {event.image_url && (
        <img src={event.image_url} alt={event.title} className="w-full h-40 object-cover rounded-t-lg" />
      )}
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        {event.description && <CardDescription className="pt-2">{event.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-2 mt-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{format(new Date(event.event_time), "PPP p")}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;
