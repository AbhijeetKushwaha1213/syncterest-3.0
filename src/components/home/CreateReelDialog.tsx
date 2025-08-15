
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CreateReelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateReelDialog: React.FC<CreateReelDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Reel</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Reel creation form goes here</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReelDialog;
