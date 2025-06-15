
import { Button } from '@/components/ui/button';
import { FileText, ImageIcon, X } from 'lucide-react';

interface AttachmentPreviewProps {
  file: File;
  onRemove: () => void;
}

const AttachmentPreview = ({ file, onRemove }: AttachmentPreviewProps) => {
  const isImage = file.type.startsWith('image/');

  return (
    <div className="relative flex items-center gap-3 p-2 pr-10 border rounded-lg bg-muted/30">
      {isImage ? (
        <ImageIcon className="h-6 w-6 shrink-0 text-muted-foreground" />
      ) : (
        <FileText className="h-6 w-6 shrink-0 text-muted-foreground" />
      )}
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {Math.round(file.size / 1024)} KB
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AttachmentPreview;
