
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const HomeTabs = () => {
  return (
    <Tabs defaultValue="home" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="nearby">Nearby</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
      </TabsList>
      
      <TabsContent value="home" className="space-y-6">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-muted-foreground">Home content goes here</p>
        </div>
      </TabsContent>

      <TabsContent value="nearby" className="space-y-6">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-muted-foreground">Nearby users content goes here</p>
        </div>
      </TabsContent>

      <TabsContent value="events" className="space-y-6">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-muted-foreground">Events content goes here</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default HomeTabs;
