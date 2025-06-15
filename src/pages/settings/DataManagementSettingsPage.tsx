
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const DataManagementSettingsPage = () => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileError) throw profileError;

      // In a real app, you would fetch data from all relevant tables.
      // This is a simplified example.
      const userData = {
        profile,
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
        description: 'Failed to export your data. Please try again.',
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
            <p className="text-sm text-muted-foreground">Download a copy of all your data from the platform.</p>
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
