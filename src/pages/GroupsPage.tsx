
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";

const GroupsPage = () => {
  const { toast } = useToast();

  const handleCreateGroup = () => {
    toast({
      title: "Feature Under Development",
      description: "Group creation feature is coming soon! Stay tuned for updates.",
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Groups</h2>
        <Button onClick={handleCreateGroup}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="text-center py-20 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-semibold">Groups Feature Coming Soon</h3>
        <p className="text-muted-foreground mt-2">
          We're working hard to bring you an amazing groups experience. Check back soon!
        </p>
      </div>
    </div>
  );
};

export default GroupsPage;
