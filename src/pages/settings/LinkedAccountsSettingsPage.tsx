
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { Badge } from '@/components/ui/badge';

const providerDetails = [
  { id: 'google', name: 'Google', icon: GoogleIcon },
  { id: 'github', name: 'GitHub', icon: GitHubIcon },
];

type ProviderId = 'google' | 'github';

const LinkedAccountsSettingsPage = () => {
  const { user } = useAuth();

  const handleLinkAccount = async (provider: ProviderId) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.href,
      },
    });

    if (error) {
      toast({
        title: `Error connecting to ${provider}`,
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const linkedProviders = user?.identities?.map(i => i.provider) ?? [];
  const primaryProvider = user?.app_metadata?.provider;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Accounts</CardTitle>
        <CardDescription>
          Manage your connected accounts from other services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providerDetails.map((provider) => {
            const isLinked = linkedProviders.includes(provider.id);
            const isPrimary = primaryProvider === provider.id;

            return (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <provider.icon className="h-6 w-6" />
                  <span className="font-semibold">{provider.name}</span>
                  {isPrimary && <Badge variant="secondary">Primary</Badge>}
                </div>
                {isLinked ? (
                   <Button variant="outline" disabled>Connected</Button>
                ) : (
                  <Button onClick={() => handleLinkAccount(provider.id as ProviderId)}>
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkedAccountsSettingsPage;
