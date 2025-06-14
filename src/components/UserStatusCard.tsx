
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";

const statuses = [
  { label: "Looking to chat", color: "text-green-500", active: true },
  { label: "Open to meetup", color: "text-blue-500", active: false },
  { label: "Studying", color: "text-yellow-500", active: false },
  { label: "Exploring", color: "text-purple-500", active: false },
];

const UserStatusCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Button
            key={status.label}
            variant={status.active ? "secondary" : "ghost"}
            className="rounded-full"
          >
            <Circle className={`mr-2 h-3 w-3 ${status.color} fill-current`} />
            {status.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default UserStatusCard;
