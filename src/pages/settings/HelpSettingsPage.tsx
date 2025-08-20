
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageCircle, BookOpen, Bug, Mail } from 'lucide-react';

const HelpSettingsPage = () => {
  const handleContactSupport = () => {
    window.open('mailto:support@yourapp.com?subject=Support Request', '_blank');
  };

  const handleReportBug = () => {
    window.open('mailto:bugs@yourapp.com?subject=Bug Report', '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
          <CardDescription>
            Get help, report issues, or provide feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left"
              onClick={handleContactSupport}
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">Contact Support</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Get help with your account or app usage
              </p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left"
              onClick={handleReportBug}
            >
              <div className="flex items-center gap-2 mb-2">
                <Bug className="h-5 w-5" />
                <span className="font-semibold">Report a Bug</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Help us improve by reporting issues
              </p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left"
              asChild
            >
              <a href="#" onClick={(e) => e.preventDefault()}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-semibold">Documentation</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Learn how to use all features
                </p>
              </a>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left"
              asChild
            >
              <a href="#" onClick={(e) => e.preventDefault()}>
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="h-5 w-5" />
                  <span className="font-semibold">Community Forum</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect with other users
                </p>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span>Today</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform</span>
            <span>Web</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Privacy Policy
              <ExternalLink className="ml-auto h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Terms of Service
              <ExternalLink className="ml-auto h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Cookie Policy
              <ExternalLink className="ml-auto h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSettingsPage;
