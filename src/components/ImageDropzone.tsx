import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getStoragePublicUrl } from '@/lib/storage';

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
}

const ImageDropzone = ({ value, onChange }: ImageDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
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
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Upload directly to 'article-images' bucket
      const { data, error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Retrieve the full public URL using data.path
      const imagePath = data?.path || fileName;
      const { data: urlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(imagePath);

      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) {
        throw new Error('Не вдалося отримати публічне посилання на зображення');
      }

      // Save the full public URL to state
      onChange(publicUrl);
      toast.success('Зображення успішно завантажено');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error?.message || 'Помилка завантаження зображення');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onChange]);

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
  }, [uploadFile]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const resolvedSrc = getStoragePublicUrl(value) || value;

  if (value) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
        <img
          src={resolvedSrc}
          alt="Зображення статті"
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallback) {
              target.dataset.fallback = 'true';
              target.src = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop';
            }
          }}
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 shadow-md cursor-pointer"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

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
              {isDragging ? 'Відпустіть для завантаження' : 'Натисніть або перетягніть зображення сюди'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PNG, JPG, WEBP, GIF до 5 МБ
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageDropzone;
