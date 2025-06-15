
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { LifeBuoy, Mail, FileText } from 'lucide-react';

const HelpSettingsPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Help & Support</CardTitle>
        <CardDescription>
          Find help and information about our service.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <a href="#" className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors">
            <LifeBuoy className="h-6 w-6 mr-4 text-primary" />
            <div>
              <h3 className="font-semibold">Help Center & FAQ</h3>
              <p className="text-sm text-muted-foreground">Find answers to frequently asked questions.</p>
            </div>
          </a>
          <a href="mailto:support@example.com" className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors">
            <Mail className="h-6 w-6 mr-4 text-primary" />
            <div>
              <h3 className="font-semibold">Contact Us</h3>
              <p className="text-sm text-muted-foreground">Get in touch with our support team.</p>
            </div>
          </a>
        </div>
        <div className="space-y-2 pt-4 border-t">
            <h3 className="text-lg font-semibold">Legal</h3>
            <div className="space-y-2">
                <Link to="/terms-of-service" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="h-4 w-4 mr-2" /> Terms of Service
                </Link>
                <Link to="/privacy-policy" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="h-4 w-4 mr-2" /> Privacy Policy
                </Link>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelpSettingsPage;
