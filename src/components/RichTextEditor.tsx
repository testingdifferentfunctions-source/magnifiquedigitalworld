import React, { useRef, useCallback, useEffect, useState, memo } from 'react';
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
  Terminal,
  Palette,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'img', 'a', 'span', 'div'
  ],
  ALLOWED_ATTR: ['class', 'href', 'src', 'alt', 'title', 'target', 'rel', 'style', 'loading', 'width', 'height'],
  ADD_ATTR: ['target', 'rel'],
};

function saveSelection(containerEl: HTMLElement): { start: number; end: number } | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!containerEl.contains(range.startContainer)) return null;

  try {
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(containerEl);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const start = preCaretRange.toString().length;

    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const end = preCaretRange.toString().length;

    return { start, end };
  } catch {
    return null;
  }
}

function restoreSelection(containerEl: HTMLElement, savedSel: { start: number; end: number } | null) {
  if (!savedSel) return;
  const selection = window.getSelection();
  if (!selection) return;

  try {
    let charIndex = 0;
    const range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);

    const nodeStack: Node[] = [containerEl];
    let node: Node | undefined;
    let foundStart = false;
    let stop = false;

    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharIndex = charIndex + (node.textContent?.length || 0);
        if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
          range.setStart(node, savedSel.start - charIndex);
          foundStart = true;
        }
        if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
          range.setEnd(node, savedSel.end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    selection.removeAllRanges();
    selection.addRange(range);
  } catch {
    // Ignore selection restoration failure
  }
}

const RichTextEditorComponent = ({ value, onChange, maxLength = 50000 }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const lastEmittedValueRef = useRef<string>(value || '');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const [charCount, setCharCount] = useState<number>((value || '').length);

  const flushPending = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      if (content !== lastEmittedValueRef.current) {
        lastEmittedValueRef.current = content;
        onChangeRef.current(content);
      }
    }
  }, []);

  // Sync external value into the DOM ONLY when the editor is NOT focused and the value truly changed externally
  useEffect(() => {
    if (!editorRef.current) return;

    // 1. Initial mount or first hydration
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      const clean = DOMPurify.sanitize(value || '', DOMPURIFY_CONFIG);
      editorRef.current.innerHTML = clean;
      lastEmittedValueRef.current = value || '';
      setCharCount((value || '').length);
      return;
    }

    // 2. CRITICAL: If the user is currently focused in the editor, NEVER overwrite innerHTML!
    // The live DOM in the browser is the active source of truth.
    // Overwriting innerHTML while typing destroys the active selection and causes cursor jumping.
    const isFocused =
      typeof document !== 'undefined' &&
      (document.activeElement === editorRef.current || editorRef.current.contains(document.activeElement));
    if (isFocused) {
      return;
    }

    // 3. If external value matches what we already emitted or what innerHTML contains, do NOT touch DOM
    if (value === lastEmittedValueRef.current) return;
    if (editorRef.current.innerHTML === value) {
      lastEmittedValueRef.current = value;
      return;
    }

    // 4. Editor is NOT focused and value changed externally (e.g. backend data loaded, draft discarded, clear button clicked)
    const clean = DOMPurify.sanitize(value || '', DOMPURIFY_CONFIG);
    if (editorRef.current.innerHTML !== clean) {
      editorRef.current.innerHTML = clean;
      lastEmittedValueRef.current = value || '';
      setCharCount((value || '').length);
    }
  }, [value]);

  // Flush any pending content during tab switch, page refresh or unmount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPending();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', flushPending);
    window.addEventListener('pagehide', flushPending);

    return () => {
      flushPending();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', flushPending);
      window.removeEventListener('pagehide', flushPending);
    };
  }, [flushPending]);

  const execCommand = useCallback((command: string, cmdValue?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, cmdValue);
    const content = editorRef.current.innerHTML;
    lastEmittedValueRef.current = content;
    setCharCount(content.length);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onChangeRef.current(content);
  }, []);

  const insertHTML = useCallback((html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
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
    const content = editorRef.current.innerHTML;
    lastEmittedValueRef.current = content;
    setCharCount(content.length);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onChangeRef.current(content);
  }, []);

  const handleInput = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    lastEmittedValueRef.current = content;
    setCharCount(content.length);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    // Debounce the state notification so fast typing does not re-render parent on every keypress
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      onChangeRef.current(content);
    }, 200);
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

  const insertInlineCode = () => {
    const selection = window.getSelection();
    if (!selection || !selection.toString()) return;
    insertHTML(`<code>${selection.toString()}</code>`);
  };

  const applyPurpleAccent = () => {
    const selection = window.getSelection();
    if (!selection || !selection.toString()) return;
    insertHTML(`<span class="text-purple-accent">${selection.toString()}</span>`);
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
    { icon: Terminal, action: insertInlineCode, title: 'Інлайновий код' },
    { icon: Palette, action: applyPurpleAccent, title: 'Фіолетовий текст' },
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
              onMouseDown={(e) => {
                // Prevent button click from stealing focus from contentEditable
                e.preventDefault();
              }}
              onClick={button.action}
              title={button.title}
              className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary cursor-pointer"
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Editor - Content is managed directly on DOM ref to preserve cursor & selection */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={flushPending}
        dir="ltr"
        className="article-content min-h-[300px] p-4 bg-background focus:outline-none prose prose-sm dark:prose-invert max-w-none
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
        {charCount}/{maxLength}
      </div>
    </div>
  );
};

const RichTextEditor = memo(RichTextEditorComponent);
RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
