
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLiveActivities } from '@/hooks/useLiveActivities';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Users, Activity, Filter } from 'lucide-react';
import SectionErrorBoundary from '../SectionErrorBoundary';
import LoadingBoundary from '../LoadingBoundary';
import LiveStatusForm from './LiveStatusForm';
import EnhancedLiveActivityCard from './EnhancedLiveActivityCard';
import LiveActivityFilters from './LiveActivityFilters';
import MyStatusSelector from './MyStatusSelector';

const LiveUsersTabSkeleton = () => (
  <div className="space-y-6">
    <div className="p-4 border rounded-lg">
      <Skeleton className="h-8 w-32 mb-4" />
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
    
    <div>
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LiveUsersTab = () => {
  const { activities, isLoading } = useLiveActivities();
  const { user, loading: authLoading } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('All Activities');
  const [selectedTime, setSelectedTime] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const otherActivities = (activities || []).filter(a => a.user_id !== user?.id);
  const userActivity = (activities || []).find(a => a.user_id === user?.id);

  // Apply filters to activities
  const filteredActivities = otherActivities.filter(activity => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesActivity = activity.activity_type.toLowerCase().includes(searchLower);
      const matchesUser = activity.profiles?.username?.toLowerCase().includes(searchLower) ||
                         activity.profiles?.full_name?.toLowerCase().includes(searchLower);
      const matchesLocation = activity.custom_message?.toLowerCase().includes(searchLower);
      
      if (!(matchesActivity || matchesUser || matchesLocation)) {
        return false;
      }
    }

    // Activity type filter
    if (selectedActivity !== 'All Activities') {
      if (!activity.activity_type.includes(selectedActivity)) {
        return false;
      }
    }

    // Time filter
    const now = new Date();
    const activityStart = new Date(activity.created_at);
    const activityEnd = new Date(activity.expires_at);

    switch (selectedTime) {
      case 'now':
        if (now < activityStart || now > activityEnd) return false;
        break;
      case 'today':
        if (activityStart.toDateString() !== now.toDateString()) return false;
        break;
      case 'tomorrow':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (activityStart.toDateString() !== tomorrow.toDateString()) return false;
        break;
      case 'week':
        const weekFromNow = new Date(now);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        if (activityStart > weekFromNow) return false;
        break;
    }

    return true;
  });

  return (
    <LoadingBoundary
      isLoading={authLoading}
      loadingComponent={<LiveUsersTabSkeleton />}
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live Feed
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Status
            </TabsTrigger>
            <TabsTrigger value="my-status" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              My Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {/* Filters */}
            <SectionErrorBoundary sectionName="Activity Filters">
              <LiveActivityFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedActivity={selectedActivity}
                onActivityChange={setSelectedActivity}
                selectedTime={selectedTime}
                onTimeChange={setSelectedTime}
                selectedDistance={selectedDistance}
                onDistanceChange={setSelectedDistance}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </SectionErrorBoundary>

            {/* Live Activities Feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  Live Activities ({isLoading ? '...' : filteredActivities.length})
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Activity
                </Button>
              </div>
              
              <LoadingBoundary
                isLoading={isLoading}
                loadingComponent={
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-6 border rounded-lg space-y-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-64" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-2">
                          <Skeleton className="h-10 w-20" />
                          <Skeleton className="h-10 w-24" />
                          <Skeleton className="h-10 w-10" />
                        </div>
                      </div>
                    ))}
                  </div>
                }
              >
                {filteredActivities.length > 0 ? (
                  <div className="space-y-4">
                    {filteredActivities.map(activity => (
                      <SectionErrorBoundary key={activity.id} sectionName="Activity Card">
                        <EnhancedLiveActivityCard activity={activity} />
                      </SectionErrorBoundary>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg">
                    <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground font-semibold">No live activities found</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchTerm || selectedActivity !== 'All Activities' || selectedTime !== 'all' 
                        ? 'Try adjusting your filters or search terms'
                        : 'Be the first to post a live activity!'}
                    </p>
                    <Button onClick={() => setActiveTab('create')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Live Activity
                    </Button>
                  </div>
                )}
              </LoadingBoundary>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <SectionErrorBoundary sectionName="Live Status Form">
              <LiveStatusForm />
            </SectionErrorBoundary>
          </TabsContent>

          <TabsContent value="my-status" className="space-y-6">
            <SectionErrorBoundary sectionName="My Status">
              <div className="space-y-6">
                <MyStatusSelector />
                
                {userActivity && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Current Live Activity</h3>
                    <EnhancedLiveActivityCard activity={{...userActivity, profiles: {
                      id: user?.id || '',
                      username: 'You',
                      full_name: 'You',
                      avatar_url: null
                    }}} />
                  </div>
                )}
              </div>
            </SectionErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </LoadingBoundary>
  );
};

export default LiveUsersTab;
