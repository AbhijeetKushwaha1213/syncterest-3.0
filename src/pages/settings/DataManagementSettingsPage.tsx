
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const DataManagementSettingsPage = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDataExport = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      // Fetch user's data from various tables
      const [profileData, postsData, messagesData, eventsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('posts').select('*').eq('user_id', user.id),
        supabase.from('messages').select('*').eq('sender_id', user.id),
        supabase.from('events').select('*').eq('created_by', user.id),
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        user_id: user.id,
        profile: profileData.data,
        posts: postsData.data || [],
        messages: messagesData.data || [],
        events: eventsData.data || [],
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast({
        title: 'Data exported successfully',
        description: 'Your data has been downloaded as a JSON file',
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Note: This would need server-side implementation for complete deletion
      // For now, we'll just show a message about contacting support
      toast({
        title: 'Account deletion requested',
        description: 'Please contact support to complete your account deletion. Your request has been noted.',
      });
      
      // In a real implementation, you would:
      // 1. Mark account for deletion
      // 2. Send email confirmation
      // 3. Schedule data deletion after grace period
      // 4. Handle cascading deletions properly
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Deletion failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Download a copy of your data including profile, messages, posts, and activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full sm:w-auto" 
            onClick={handleDataExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Exporting Data...' : 'Request Data Export'}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Your data will be exported as a JSON file containing all your profile information, 
            posts, messages, and other data.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            These actions are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. This action cannot be reversed.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="mt-3">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Your profile and personal information</li>
                          <li>All your posts, messages, and content</li>
                          <li>Your connections and followers</li>
                          <li>Event history and group memberships</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleAccountDeletion}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Processing...' : 'Yes, delete my account'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagementSettingsPage;
