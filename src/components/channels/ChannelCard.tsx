
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Flame, Hash, Users as UsersIcon } from "lucide-react";

export type Channel = {
  id: number;
  name: string;
  description: string;
  isPopular: boolean;
  memberCount: number;
  type: 'Public' | 'Private';
  tags: string[];
  members: { avatarUrl: string; name: string }[];
  status: string;
  logoLetter: string;
};

interface ChannelCardProps {
    channel: Channel;
}

const ChannelCard = ({ channel }: ChannelCardProps) => {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <Avatar className="h-12 w-12 rounded-lg">
                           <AvatarImage src="" alt={channel.name} />
                           <AvatarFallback className="rounded-lg bg-muted text-xl">{channel.logoLetter}</AvatarFallback>
                       </Avatar>
                       <div>
                            {channel.isPopular && (
                                <Badge variant="secondary" className="mb-1 text-orange-500 bg-orange-50 border-orange-200">
                                    <Flame className="mr-1 h-4 w-4" />
                                    Popular
                                </Badge>
                            )}
                            <CardTitle className="text-lg">{channel.name}</CardTitle>
                       </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground pt-1">
                        <UsersIcon className="mr-1 h-4 w-4" />
                        {channel.memberCount}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">{channel.description}</p>
                <div className="flex flex-wrap gap-2">
                    {channel.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex -space-x-2">
                        {channel.members.slice(0, 3).map((member, index) => (
                             <Avatar key={index} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={member.avatarUrl} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <span>{channel.members.length} &bull; {channel.status}</span>
                </div>
                <Button variant="outline" className="w-full">Join Channel</Button>
            </CardFooter>
        </Card>
    );
};

export default ChannelCard;
