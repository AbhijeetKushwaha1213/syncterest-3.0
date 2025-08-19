
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const GroupsPage = () => {
  const handleCreateGroup = () => {
    toast({
      title: "Feature Under Development",
      description: "Groups functionality is coming soon! We're working hard to bring you this feature.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Groups</h2>
        <Button onClick={handleCreateGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      <Card className="text-center py-12">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Groups Feature Coming Soon</CardTitle>
          <CardDescription>
            We're working on bringing you amazing group functionality. Stay tuned for updates!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCreateGroup} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupsPage;
