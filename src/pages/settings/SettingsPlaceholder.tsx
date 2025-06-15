
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SettingsPlaceholder = ({ title, description }: { title: string, description: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This section is under construction.</p>
      </CardContent>
    </Card>
  );
};

export default SettingsPlaceholder;
