
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
    <div className="space-y-4 sm:space-y-6 mx-2 sm:mx-0">
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Help & Support</CardTitle>
          <CardDescription className="text-sm">
            Get help, report issues, or provide feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-start text-left min-h-[80px]"
              onClick={handleContactSupport}
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">Contact Support</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Get help with your account or app usage
              </p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-start text-left min-h-[80px]"
              onClick={handleReportBug}
            >
              <div className="flex items-center gap-2 mb-2">
                <Bug className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">Report a Bug</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Help us improve by reporting issues
              </p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-start text-left min-h-[80px]"
              asChild
            >
              <a href="#" onClick={(e) => e.preventDefault()}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">Documentation</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Learn how to use all features
                </p>
              </a>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-start text-left min-h-[80px]"
              asChild
            >
              <a href="#" onClick={(e) => e.preventDefault()}>
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">Community Forum</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Connect with other users
                </p>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">App Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Updated</span>
            <span>Today</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform</span>
            <span>Web</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Legal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 sm:px-6 pb-4 sm:pb-6">
          <Button variant="ghost" className="w-full justify-start min-h-[44px]" asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <span className="text-sm sm:text-base">Privacy Policy</span>
              <ExternalLink className="ml-auto h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start min-h-[44px]" asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <span className="text-sm sm:text-base">Terms of Service</span>
              <ExternalLink className="ml-auto h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start min-h-[44px]" asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <span className="text-sm sm:text-base">Cookie Policy</span>
              <ExternalLink className="ml-auto h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSettingsPage;
