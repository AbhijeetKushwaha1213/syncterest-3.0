
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

interface InterestsFormSectionProps {
  control: Control<any>; // Using 'any' to avoid type complexities and potential circular dependencies.
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
          <div className="space-y-4">
            {interestsWithSubcategories.map((interest) => {
              const isSelected = field.value?.some(
                (v: string) => v.startsWith(interest.label + ":")
              );

              return (
                <div key={interest.id} className="space-y-2 rounded-md border p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={interest.id}
                      checked={!!isSelected}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          const currentValues = field.value || [];
                          field.onChange(
                            currentValues.filter(
                              (value: string) => !value.startsWith(interest.label + ":")
                            )
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={interest.id}
                      className="font-medium text-sm leading-none"
                    >
                      {interest.label}
                    </label>
                  </div>
                  {isSelected && (
                    <div className="pl-7 pt-2">
                      {interest.subcategories.type === 'multiselect' && (
                        <div className="space-y-2">
                          <FormLabel className="text-sm font-normal">{interest.subcategories.label}</FormLabel>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {interest.subcategories.options?.map((option) => {
                              const value = `${interest.label}: ${option}`;
                              const isChecked = field.value?.includes(value);
                              return (
                                <div key={option} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${interest.id}-${option}`}
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
                                    htmlFor={`${interest.id}-${option}`}
                                    className="text-sm font-normal"
                                  >
                                    {option}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {interest.subcategories.type === 'text' && (
                         <div>
                           <FormLabel className="text-sm font-normal">{interest.subcategories.label}</FormLabel>
                           <Textarea
                             placeholder={interest.subcategories.placeholder}
                             value={
                               field.value?.find((v: string) => v.startsWith(interest.label + ":"))?.split(": ")[1] || ""
                             }
                             onChange={(e) => {
                               const text = e.target.value;
                               const currentValues = field.value || [];
                               const otherValues = currentValues.filter(
                                 (value: string) => !value.startsWith(interest.label + ":")
                               );
                               if (text.trim()) {
                                 field.onChange([
                                   ...otherValues,
                                   `${interest.label}: ${text.trim()}`,
                                 ]);
                               } else {
                                 field.onChange(otherValues);
                               }
                             }}
                             className="mt-2"
                           />
                         </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
