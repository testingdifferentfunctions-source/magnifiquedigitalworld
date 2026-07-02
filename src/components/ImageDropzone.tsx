import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
}

const ImageDropzone = ({ value, onChange }: ImageDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Дозволені лише зображення');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Максимальний розмір файлу — 5 МБ');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success('Зображення завантажено');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Помилка завантаження зображення');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  }, []);

  const handleRemove = () => {
    onChange('');
  };

  if (value) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border">
        <img
          src={value}
          alt="Зображення статті"
          className="w-full h-48 object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-8
        flex flex-col items-center justify-center gap-4
        transition-colors cursor-pointer min-h-[200px]
        ${isDragging 
          ? 'border-primary bg-primary/10' 
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }
        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {isUploading ? (
        <>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Завантаження...</p>
        </>
      ) : (
        <>
          <div className="p-4 rounded-full bg-muted">
            {isDragging ? (
              <ImageIcon className="h-8 w-8 text-primary" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="text-center">
            <p className="font-medium">
              {isDragging ? 'Відпустіть для завантаження' : 'Перетягніть зображення сюди'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PNG, JPG, GIF до 5 МБ
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageDropzone;
