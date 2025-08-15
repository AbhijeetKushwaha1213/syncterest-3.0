
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const LanguageSettingsPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Language</CardTitle>
        <CardDescription>
          Choose your preferred language for the interface.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup defaultValue="en" className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="en" id="en" />
            <Label htmlFor="en">English</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="es" id="es" />
            <Label htmlFor="es">Español</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fr" id="fr" />
            <Label htmlFor="fr">Français</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="de" id="de" />
            <Label htmlFor="de">Deutsch</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default LanguageSettingsPage;
