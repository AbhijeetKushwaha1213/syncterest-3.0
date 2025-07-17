
import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimeSelectorProps {
  value?: string;
  onChange: (time: string) => void;
}

const TimeSelector = ({ value, onChange }: TimeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();
  const displayTime = value 
    ? new Date(`2000-01-01T${value}`).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : "Select time";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="max-h-60 overflow-y-auto p-1">
          {timeOptions.map((time) => (
            <Button
              key={time.value}
              variant="ghost"
              className="w-full justify-start font-normal"
              onClick={() => {
                onChange(time.value);
                setIsOpen(false);
              }}
            >
              {time.display}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimeSelector;
