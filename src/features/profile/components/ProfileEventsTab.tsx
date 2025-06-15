
import { Database } from "@/integrations/supabase/types";
import EventCard from "@/components/events/EventCard";
import CreateEventDialog from "@/components/events/CreateEventDialog";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

type Event = Database['public']['Tables']['events']['Row'];

interface ProfileEventsTabProps {
  events: Event[];
  isOwnProfile: boolean;
}

export const ProfileEventsTab = ({ events, isOwnProfile }: ProfileEventsTabProps) => {
  return (
    <div className="space-y-6">
      {isOwnProfile && (
        <div className="flex justify-end">
          <CreateEventDialog />
        </div>
      )}
      {events.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} className="block h-full">
              <EventCard event={event} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-center p-4">
          <Calendar className="w-12 h-12 mb-4 text-muted-foreground"/>
          <h3 className="text-xl font-semibold">No Events Yet</h3>
          {isOwnProfile ? (
            <p className="text-muted-foreground mt-2">Create your first event and bring people together!</p>
          ) : (
            <p className="text-muted-foreground mt-2">This user hasn't created any events yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

