
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import EventCard from "./EventCard";
import CreateEventDialog from "./CreateEventDialog";
import { Skeleton } from "@/components/ui/skeleton";

type Event = Database['public']['Tables']['events']['Row'];

const fetchEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

const EventsList = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error: {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateEventDialog />
      </div>
      {events && events.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4 text-center p-4">
          <h3 className="text-xl font-semibold">No events yet</h3>
          <p className="text-muted-foreground mt-2">Be the first to create an event and bring people together!</p>
        </div>
      )}
    </div>
  );
};

export default EventsList;
