
import { useState, useCallback } from "react";
import { Upload, X, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventImageUploadProps {
  onImageChange: (file: File | undefined) => void;
  currentImage?: File;
}

const EventImageUpload = ({ onImageChange, currentImage }: EventImageUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      onImageChange(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      onImageChange(undefined);
      setPreview(null);
    }
  }, [onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const clearImage = () => {
    setPreview(null);
    onImageChange(undefined);
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Event Image</label>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          preview ? "border-solid" : ""
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Event preview"
              className="w-full h-48 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
              <Image className="h-full w-full" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Drop an image here, or click to select</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        )}
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default EventImageUpload;
