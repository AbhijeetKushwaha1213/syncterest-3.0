
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
    <Card className="mx-2 sm:mx-0">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Linked Accounts</CardTitle>
        <CardDescription className="text-sm">
          Manage your connected accounts from other services.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-3 sm:space-y-4">
          {providerDetails.map((provider) => {
            const isLinked = linkedProviders.includes(provider.id);
            const isPrimary = primaryProvider === provider.id;

            return (
              <div key={provider.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <provider.icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">{provider.name}</span>
                  {isPrimary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                </div>
                {isLinked ? (
                   <Button variant="outline" disabled className="w-full sm:w-auto min-h-[36px] sm:min-h-[32px]">
                     Connected
                   </Button>
                ) : (
                  <Button 
                    onClick={() => handleLinkAccount(provider.id as ProviderId)}
                    className="w-full sm:w-auto min-h-[36px] sm:min-h-[32px]"
                  >
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
