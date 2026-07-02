import { useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DOMPurify from 'dompurify';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Link as LinkIcon,
  List,
  ListOrdered,
  Code,
  Quote,
  Table,
  Minus,

} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'img', 'a', 'span', 'div'],
  ALLOWED_ATTR: ['class', 'href', 'src', 'alt', 'title', 'target', 'rel'],
  ADD_ATTR: ['target', 'rel'],

};

const RichTextEditor = ({ value, onChange, maxLength = 50000 }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync external value into the DOM only when it differs, to avoid resetting
  // the caret on every keystroke.
  useEffect(() => {
    if (!editorRef.current) return;
    const clean = DOMPurify.sanitize(value, DOMPURIFY_CONFIG);
    if (editorRef.current.innerHTML !== clean) {
      editorRef.current.innerHTML = clean;
    }
  }, [value]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertHTML = useCallback((html: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const fragment = document.createRange().createContextualFragment(html);
      range.insertNode(fragment);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      if (content.length <= maxLength) {
        onChange(content);
      }
    }
  };

  const insertHeading = (level: 1 | 2 | 3 | 4) => {
    execCommand('formatBlock', `h${level}`);
  };

  const insertLink = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    const url = window.prompt('Введіть URL:', 'https://');
    if (!url) return;
    let safeUrl = url.trim();
    if (!/^(https?:\/\/|mailto:|\/)/i.test(safeUrl)) {
      safeUrl = `https://${safeUrl}`;
    }
    const escapedUrl = safeUrl.replace(/"/g, '&quot;');
    const linkText = selectedText || safeUrl;
    insertHTML(`<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
  };
  const insertCodeBlock = () => {
    insertHTML('<pre class="code-block"><code>// Ваш код тут</code></pre><p></p>');
  };


  const insertTable = () => {
    const tableHTML = `
      <table class="editor-table">
        <thead>
          <tr>
            <th>Заголовок 1</th>
            <th>Заголовок 2</th>
            <th>Заголовок 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Комірка 1</td>
            <td>Комірка 2</td>
            <td>Комірка 3</td>
          </tr>
          <tr>
            <td>Комірка 4</td>
            <td>Комірка 5</td>
            <td>Комірка 6</td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `;
    insertHTML(tableHTML);
  };

  const insertHorizontalRule = () => {
    insertHTML('<hr /><p></p>');
  };

  const toolbarButtons = [
    { icon: Bold, action: () => execCommand('bold'), title: 'Жирний' },
    { icon: Italic, action: () => execCommand('italic'), title: 'Курсив' },
    { icon: Underline, action: () => execCommand('underline'), title: 'Підкреслений' },
    { icon: Strikethrough, action: () => execCommand('strikeThrough'), title: 'Закреслений' },
    { type: 'separator' },
    { icon: Heading1, action: () => insertHeading(1), title: 'Заголовок 1' },
    { icon: Heading2, action: () => insertHeading(2), title: 'Заголовок 2' },
    { icon: Heading3, action: () => insertHeading(3), title: 'Заголовок 3' },
    { icon: Heading4, action: () => insertHeading(4), title: 'Заголовок 4' },
    { type: 'separator' },
    { icon: List, action: () => execCommand('insertUnorderedList'), title: 'Маркований список' },
    { icon: ListOrdered, action: () => execCommand('insertOrderedList'), title: 'Нумерований список' },
    { icon: LinkIcon, action: insertLink, title: 'Посилання' },
    { type: 'separator' },

    { icon: Quote, action: () => execCommand('formatBlock', 'blockquote'), title: 'Цитата' },
    { icon: Code, action: insertCodeBlock, title: 'Блок коду' },
    { icon: Table, action: insertTable, title: 'Таблиця' },
    { icon: Minus, action: insertHorizontalRule, title: 'Горизонтальна лінія' },
  ];

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b border-border">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return <Separator key={index} orientation="vertical" className="h-6 mx-1" />;
          }
          const Icon = button.icon!;
          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={button.action}
              title={button.title}
              className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary"
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dir="ltr"
        className="min-h-[300px] p-4 bg-background focus:outline-none prose prose-sm dark:prose-invert max-w-none
          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5
          [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4
          [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3
          [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80
          [&_p]:mb-3
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3
          [&_li]:mb-1
          [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground
          [&_.code-block]:bg-muted [&_.code-block]:rounded-md [&_.code-block]:p-4 [&_.code-block]:my-4 [&_.code-block]:overflow-x-auto [&_.code-block]:font-mono [&_.code-block]:text-sm
          [&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:font-mono [&_pre]:text-sm
          [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm
          [&_.editor-table]:w-full [&_.editor-table]:border-collapse [&_.editor-table]:my-4
          [&_.editor-table_th]:border [&_.editor-table_th]:border-border [&_.editor-table_th]:bg-muted [&_.editor-table_th]:px-3 [&_.editor-table_th]:py-2 [&_.editor-table_th]:text-left [&_.editor-table_th]:font-semibold
          [&_.editor-table_td]:border [&_.editor-table_td]:border-border [&_.editor-table_td]:px-3 [&_.editor-table_td]:py-2
          [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
          [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
          [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2
          [&_hr]:my-6 [&_hr]:border-border
          [&_strong]:font-bold
          [&_em]:italic
          [&_u]:underline
          [&_s]:line-through
        "
      />

      {/* Character count */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30">
        {value.length}/{maxLength}
      </div>
    </div>
  );
};

export default RichTextEditor;
