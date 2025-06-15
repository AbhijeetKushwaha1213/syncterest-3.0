
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const DataManagementSettingsPage = () => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      // Fetch all user-related data in parallel for efficiency
      const [
        profileRes,
        postsRes,
        storiesRes,
        followersRes,
        followingRes,
        eventsRes,
        groupMembershipsRes,
        subscriptionRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('posts').select('*').eq('user_id', user.id),
        supabase.from('stories').select('*').eq('user_id', user.id),
        supabase.from('followers').select('following_id').eq('follower_id', user.id), // Users this user follows
        supabase.from('followers').select('follower_id').eq('following_id', user.id), // Users that follow this user
        supabase.from('events').select('*').eq('created_by', user.id),
        supabase.from('group_members').select('group_id').eq('user_id', user.id),
        supabase.from('subscribers').select('subscribed, subscription_tier, subscription_end').eq('user_id', user.id).maybeSingle(),
      ]);

      // Error handling for all promises
      const errors = [profileRes.error, postsRes.error, storiesRes.error, followersRes.error, followingRes.error, eventsRes.error, groupMembershipsRes.error, subscriptionRes.error].filter(Boolean);
      if (errors.length > 0) {
        throw new Error(errors.map(e => e?.message).join(', '));
      }

      const { data: profile } = profileRes;
      const { data: posts } = postsRes;
      const { data: stories } = storiesRes;
      const { data: followers } = followersRes;
      const { data: following } = followingRes;
      const { data: events } = eventsRes;
      const { data: groupMemberships } = groupMembershipsRes;
      const { data: subscription } = subscriptionRes;

      // Fetch full group details based on memberships
      const groupIds = groupMemberships?.map(gm => gm.group_id) || [];
      let groups: any[] | null = [];
      if (groupIds.length > 0) {
        const { data: groupData, error: groupsError } = await supabase.from('groups').select('*').in('id', groupIds);
        if (groupsError) throw groupsError;
        groups = groupData;
      }
      
      const userData = {
        profile,
        posts,
        stories,
        followers: followers?.map(f => f.following_id),
        following: following?.map(f => f.follower_id),
        events,
        groups,
        subscription,
        // Note: Exporting direct messages is complex and omitted for privacy and simplicity.
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data Exported',
        description: 'Your data has been successfully downloaded.',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: `Failed to export your data. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
        const { error } = await supabase.functions.invoke('delete-user-account');

        if (error) {
            throw new Error(error.message);
        }

        toast({
            title: 'Account Deletion Successful',
            description: "Your account has been deleted. You will be logged out.",
        });
        
        await supabase.auth.signOut();
        window.location.href = '/login';

    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to delete your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Export your personal data or delete your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Export Your Data</h3>
            <p className="text-sm text-muted-foreground">Download a comprehensive copy of all your data from the platform.</p>
          </div>
          <Button variant="outline" onClick={handleExportData} disabled={isExporting} className="mt-2 sm:mt-0 w-full sm:w-auto">
            {isExporting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...</> : 'Export Data'}
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-destructive/50 rounded-lg">
          <div>
            <h3 className="font-semibold text-destructive">Delete Account</h3>
            <p className="text-sm text-muted-foreground">Permanently delete your account and all of your content. This action is irreversible.</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-2 sm:mt-0 w-full sm:w-auto">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Yes, delete my account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagementSettingsPage;
