import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface TagInputProps {
  value?: string[];
  tags?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTagLength?: number;
  maxTags?: number;
  maxTagsHelperText?: string;
}

const TagInput = ({
  value,
  tags,
  onChange,
  placeholder,
  maxTagLength = 40,
  maxTags,
  maxTagsHelperText,
}: TagInputProps) => {
  const currentTags: string[] = Array.isArray(value)
    ? value
    : Array.isArray(tags)
    ? tags
    : [];

  const [draft, setDraft] = useState('');

  const atLimit = typeof maxTags === 'number' && currentTags.length >= maxTags;

  const addTag = () => {
    if (atLimit) return;
    const t = draft.trim();
    if (!t) return;
    if (t.length > maxTagLength) return;
    if (currentTags.includes(t)) {
      setDraft('');
      return;
    }
    onChange([...currentTags, t]);
    setDraft('');
  };

  const removeTag = (idx: number) => {
    onChange(currentTags.filter((_, i) => i !== idx));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !draft && currentTags.length) {
      removeTag(currentTags.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {currentTags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#A67DE8]/15 text-foreground border border-[#A67DE8]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:text-destructive transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={addTag}
        placeholder={placeholder || 'Введіть підтему та натисніть Enter'}
        maxLength={maxTagLength}
        disabled={atLimit}
        className="bg-background border-border disabled:opacity-60"
      />
      {atLimit && (
        <p className="text-xs text-muted-foreground">
          {maxTagsHelperText || `Maximum ${maxTags} tags allowed`}
        </p>
      )}
    </div>
  );
};

export default TagInput;
