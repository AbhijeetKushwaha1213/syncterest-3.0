
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';

const DataManagementSettingsPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Download a copy of your data including profile, messages, and activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Request Data Export
          </Button>
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
                <Button variant="destructive" size="sm" className="mt-3">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagementSettingsPage;
