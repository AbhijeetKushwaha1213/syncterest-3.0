
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface AddCustomOptionDialogProps {
  onAdd: (value: string) => void;
}

export const AddCustomOptionDialog = ({ onAdd }: AddCustomOptionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-auto rounded-full px-3 py-2 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add Custom
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a custom option</DialogTitle>
          <DialogDescription>
            Can't find what you're looking for? Add your own.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custom-option" className="text-right">
              Option
            </Label>
            <Input
              id="custom-option"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="col-span-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="Your custom interest"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAdd}>Add Option</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
