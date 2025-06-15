
import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { interestsWithSubcategories } from "@/data/interestsWithSubcategories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InterestsFormSectionProps {
  control: Control<any>;
}

export const InterestsFormSection = ({ control }: InterestsFormSectionProps) => {
  return (
    <FormField
      control={control}
      name="interests"
      render={({ field }) => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">Interests</FormLabel>
            <FormDescription>
              Select your interests and specify details to connect with like-minded people.
            </FormDescription>
          </div>
          <Tabs defaultValue={interestsWithSubcategories[0].id} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
              {interestsWithSubcategories.map((interest) => (
                <TabsTrigger key={interest.id} value={interest.id} className="text-xs sm:text-sm">
                  <interest.icon className="mr-2 h-4 w-4 shrink-0" />
                  {interest.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {interestsWithSubcategories.map((interest) => (
              <TabsContent key={interest.id} value={interest.id}>
                <div className="space-y-4 rounded-md border p-4">
                  {interest.subgroups.map((subgroup, index) => (
                    <div key={index}>
                      <FormLabel>{subgroup.label}</FormLabel>
                      {subgroup.description && <FormDescription>{subgroup.description}</FormDescription>}
                      <div className="pt-2">
                        {subgroup.type === 'multiselect' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {subgroup.options?.map(option => {
                              const value = `${interest.label}:${subgroup.label}:${option}`;
                              const isChecked = field.value?.includes(value);

                              return (
                                <div key={option} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${interest.id}-${subgroup.label}-${option}`}
                                    checked={!!isChecked}
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentValues, value]);
                                      } else {
                                        field.onChange(currentValues.filter((v: string) => v !== value));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`${interest.id}-${subgroup.label}-${option}`}
                                    className="text-sm font-normal"
                                  >
                                    {option}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {subgroup.type === 'text' && (
                          <Textarea
                            placeholder={subgroup.placeholder}
                            value={
                              field.value
                                ?.find((v: string) => v.startsWith(`${interest.label}:${subgroup.label}:`))
                                ?.split(':')
                                .slice(2)
                                .join(':') || ""
                            }
                            onChange={(e) => {
                              const text = e.target.value;
                              const currentValues = field.value || [];
                              const otherValues = currentValues.filter(
                                (value: string) => !value.startsWith(`${interest.label}:${subgroup.label}:`)
                              );
                              if (text.trim()) {
                                field.onChange([
                                  ...otherValues,
                                  `${interest.label}:${subgroup.label}:${text.trim()}`,
                                ]);
                              } else {
                                field.onChange(otherValues);
                              }
                            }}
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
