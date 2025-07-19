
import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PersonalityFormSectionProps {
  control: Control<any>;
}

const PersonalityFormSection: React.FC<PersonalityFormSectionProps> = ({ control }) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Personality Profile</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Help us understand you better to improve your experience and connections.
        </p>
      </div>

      <FormField
        control={control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How do you identify yourself?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="man" id="man" />
                  <Label htmlFor="man">Man</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="woman" id="woman" />
                  <Label htmlFor="woman">Woman</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non-binary" id="non-binary" />
                  <Label htmlFor="non-binary">Non-binary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                  <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What is your height?</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., 5'8&quot; or 173cm" 
                {...field} 
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ethnicity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How do you identify ethnically? (Optional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Your ethnic background" 
                {...field} 
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="conversation_style"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What do you focus on in a conversation?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="factual-details" id="factual-details" />
                  <Label htmlFor="factual-details">Factual and specific details</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="clear-direct" id="clear-direct" />
                  <Label htmlFor="clear-direct">Clear and direct talk</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deeper-emotions" id="deeper-emotions" />
                  <Label htmlFor="deeper-emotions">Deeper meanings and emotions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="future-ideas" id="future-ideas" />
                  <Label htmlFor="future-ideas">Future possibilities and ideas</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="values_in_partner"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What do you value more in a potential partner?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blunt-honesty" id="blunt-honesty" />
                  <Label htmlFor="blunt-honesty">Blunt honesty</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fairness-rationality" id="fairness-rationality" />
                  <Label htmlFor="fairness-rationality">Fairness and rationality</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="empathy-care" id="empathy-care" />
                  <Label htmlFor="empathy-care">Empathy and emotional care</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="sports_excitement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What excites you most about sports or activities?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="real-time-moment" id="real-time-moment" />
                  <Label htmlFor="real-time-moment">Sharing the real-time moment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="learning-mastering" id="learning-mastering" />
                  <Label htmlFor="learning-mastering">Learning and mastering skills</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="group-chemistry" id="group-chemistry" />
                  <Label htmlFor="group-chemistry">Exploring chemistry and group energy</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="trip_handling"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How do you usually handle a trip?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="plan-everything" id="plan-everything" />
                  <Label htmlFor="plan-everything">Plan every detail ahead</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="leave-spontaneity" id="leave-spontaneity" />
                  <Label htmlFor="leave-spontaneity">Leave room for spontaneity</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="group_behavior"
        render={({ field }) => (
          <FormItem>
            <FormLabel>In a group setting, you usually:</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="take-lead" id="take-lead" />
                  <Label htmlFor="take-lead">Take lead and energize others</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="join-share" id="join-share" />
                  <Label htmlFor="join-share">Join in and share ideas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="listen-speak" id="listen-speak" />
                  <Label htmlFor="listen-speak">Listen and speak when asked</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stay-quiet" id="stay-quiet" />
                  <Label htmlFor="stay-quiet">Stay quiet and observe</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="social_energy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>After social events, how do you feel?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="energized-more" id="energized-more" />
                  <Label htmlFor="energized-more">Energized and want more</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="need-recharge" id="need-recharge" />
                  <Label htmlFor="need-recharge">Need some recharge time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="drained-overstimulated" id="drained-overstimulated" />
                  <Label htmlFor="drained-overstimulated">Drained or overstimulated</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="day_planning"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How do you plan your day?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="with-schedule" id="with-schedule" />
                  <Label htmlFor="with-schedule">With a schedule</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rough-plan" id="rough-plan" />
                  <Label htmlFor="rough-plan">A rough plan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="go-with-flow" id="go-with-flow" />
                  <Label htmlFor="go-with-flow">Last-minute / go with flow</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="weekend_recharge"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your preferred weekend recharge:</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large-gatherings" id="large-gatherings" />
                  <Label htmlFor="large-gatherings">Large gatherings or parties</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small-groups" id="small-groups" />
                  <Label htmlFor="small-groups">Small group hangouts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quiet-alone" id="quiet-alone" />
                  <Label htmlFor="quiet-alone">Quiet time alone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="close-people" id="close-people" />
                  <Label htmlFor="close-people">Outings with 1–2 close people</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="new_experiences"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How do you approach new experiences?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stick-to-known" id="stick-to-known" />
                  <Label htmlFor="stick-to-known">Stick to what you know</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="try-if-cool" id="try-if-cool" />
                  <Label htmlFor="try-if-cool">Try it if it seems cool</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jump-unexpected" id="jump-unexpected" />
                  <Label htmlFor="jump-unexpected">Jump into anything unexpected</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PersonalityFormSection;
