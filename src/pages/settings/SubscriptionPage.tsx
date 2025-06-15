
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/ month",
    description: "For individuals and small teams just getting started.",
    features: [
      "Up to 10 projects",
      "Basic collaboration",
      "Community support",
    ],
    cta: "Your Current Plan",
    isCurrent: true,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/ month",
    description: "For growing teams that need more power and support.",
    features: [
      "Unlimited projects",
      "Advanced collaboration",
      "Priority email support",
      "Advanced analytics",
    ],
    cta: "Upgrade",
    isCurrent: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with specific needs.",
    features: [
      "Everything in Pro",
      "Single Sign-On (SSO)",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    isCurrent: false,
  },
];

const SubscriptionPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Manage your subscription plan and billing details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col ${plan.isCurrent ? 'border-primary' : ''}`}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-baseline pt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled={plan.isCurrent}>
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPage;
