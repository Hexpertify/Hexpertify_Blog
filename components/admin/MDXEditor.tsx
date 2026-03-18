'use client';

import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Heading, 
  List, 
  Link, 
  Image as ImageIcon, 
  Code, 
  Upload, 
  Table,
  Strikethrough,
  Quote,
  ListOrdered,
  CheckSquare,
  Copy,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MDXEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MDXEditor({ value, onChange }: MDXEditorProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const bgColorInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // If Cloudinary unsigned is configured, upload directly from client (no token)
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (cloudName && uploadPreset) {
        const form = new FormData();
        form.append('file', file);
        form.append('upload_preset', uploadPreset);

        const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
        const res = await fetch(url, { method: 'POST', body: form });
        const json = await res.json();

        if (!res.ok) {
          console.error('Cloudinary upload error:', json);
          throw new Error(json.error?.message || 'Cloudinary upload failed');
        }

        return json.secure_url as string;
      }

      // Fallback to server-side upload endpoint
      const formData = new FormData();
      formData.append('file', file, file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Upload response error:', data);
        throw new Error(data?.error || 'Upload failed');
      }

      return data.url as string;
    } catch (error: any) {
      console.error('Image upload failed:', error);
      throw new Error(error?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const insertImage = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await handleImageUpload(file);
        const alt = prompt('Enter alt text for the image:', file.name.split('.')[0]) || 'Blog image';
        insertMarkdown('image', url, alt);
      } catch (error) {
        const message = (error as any)?.message || 'Failed to upload image. Please try again.';
        console.error('Upload error (shown to user):', message, error);
        alert(message);
      }
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const insertMarkdown = (syntax: string, placeholder: string = '', alt?: string, color?: string) => {
    const textarea = document.getElementById('mdx-editor') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;

    let newText = '';
    let cursorOffset = 0;

    switch (syntax) {
      case 'bold':
        newText = `**${selectedText}**`;
        cursorOffset = selectedText ? newText.length : 2;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        cursorOffset = selectedText ? newText.length : 1;
        break;
      case 'heading':
        newText = `## ${selectedText}`;
        cursorOffset = selectedText ? newText.length : 3;
        break;
      case 'heading3':
        newText = `### ${selectedText}`;
        cursorOffset = selectedText ? newText.length : 4;
        break;
      case 'list':
        newText = `\n- ${selectedText}`;
        cursorOffset = newText.length;
        break;
      case 'ordered-list':
        newText = `\n1. ${selectedText}`;
        cursorOffset = newText.length;
        break;
      case 'checklist':
        newText = `\n- [ ] ${selectedText}`;
        cursorOffset = newText.length;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        cursorOffset = selectedText ? newText.length - 4 : 1;
        break;
      case 'image':
        newText = `![${alt || 'alt text'}](${selectedText || 'image-url'})`;
        cursorOffset = selectedText ? newText.length : 11;
        break;
      case 'code':
        newText = `\`${selectedText}\``;
        cursorOffset = selectedText ? newText.length : 1;
        break;
      case 'code-block':
        newText = `\`\`\`js\n${selectedText || 'code here'}\n\`\`\``;
        cursorOffset = newText.length;
        break;
      case 'code-block-python':
        newText = `\`\`\`python\n${selectedText || 'code here'}\n\`\`\``;
        cursorOffset = newText.length;
        break;
      case 'code-block-jsx':
        newText = `\`\`\`jsx\n${selectedText || '<Component />'}\n\`\`\``;
        cursorOffset = newText.length;
        break;
      case 'code-block-html':
        newText = `\`\`\`html\n${selectedText || 'html here'}\n\`\`\``;
        cursorOffset = newText.length;
        break;
      case 'strikethrough':
        newText = `~~${selectedText}~~`;
        cursorOffset = selectedText ? newText.length : 2;
        break;
      case 'blockquote':
        newText = `\n> ${selectedText}`;
        cursorOffset = newText.length;
        break;
      case 'table':
        newText = `\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Data 1 | Data 2 | Data 3 |\n`;
        cursorOffset = newText.length;
        break;
      case 'horizontal-line':
        newText = `\n---\n`;
        cursorOffset = newText.length;
        break;
      case 'jsx-component':
        newText = `<Component prop="value">\n  {/* content */}\n</Component>`;
        cursorOffset = newText.length;
        break;
      case 'text-color':
        newText = `<span style="color: ${color || textColor}">${selectedText}</span>`;
        cursorOffset = newText.length;
        break;
      case 'bg-color':
        newText = `<span style="background-color: ${color || bgColor}; padding: 2px 4px; border-radius: 3px;">${selectedText}</span>`;
        cursorOffset = newText.length;
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Basic Formatting Toolbar */}
          <div className="flex flex-wrap gap-2 border rounded-lg p-3 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('bold', 'bold text')}
              title="Bold (Ctrl+B)"
            >
              <Bold size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('italic', 'italic text')}
              title="Italic (Ctrl+I)"
            >
              <Italic size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('strikethrough', 'strikethrough')}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </Button>

            <div className="border-l border-gray-300" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('heading', 'Heading')}
              title="Heading 2"
            >
              <Heading size={16} />H2
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('heading3', 'Heading')}
              title="Heading 3"
            >
              <Heading size={14} />H3
            </Button>

            <div className="border-l border-gray-300" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('list', 'List item')}
              title="Bullet List"
            >
              <List size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('ordered-list', 'Ordered item')}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('checklist', 'Task item')}
              title="Checklist"
            >
              <CheckSquare size={16} />
            </Button>

            <div className="border-l border-gray-300" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('blockquote', 'Quote text')}
              title="Block Quote"
            >
              <Quote size={16} />
            </Button>

            <div className="border-l border-gray-300" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('code', 'code')}
              title="Inline Code"
            >
              <Code size={16} />
            </Button>

            <div className="border-l border-gray-300" />

            <div className="flex gap-2 items-center">
              <label htmlFor="text-color" className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-gray-700">
                Text Color
              </label>
              <input
                ref={colorInputRef}
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                title="Choose text color"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertMarkdown('text-color', 'colored text', undefined, textColor)}
                title="Apply Text Color"
              >
                Apply Color
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <label htmlFor="bg-color" className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-gray-700">
                Highlight
              </label>
              <input
                ref={bgColorInputRef}
                id="bg-color"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                title="Choose highlight color"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertMarkdown('bg-color', 'highlighted text', undefined, bgColor)}
                title="Apply Highlight"
              >
                Highlight
              </Button>
            </div>
          </div>

          {/* Code & Advanced Formatting Toolbar */}
          <div className="flex flex-wrap gap-2 border rounded-lg p-3 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('code-block', '')}
              title="Code Block (JavaScript)"
            >
              {"{ }"} JS
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('code-block-python', '')}
              title="Code Block (Python)"
            >
              {"{ }"} Python
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('code-block-jsx', '')}
              title="Code Block (JSX)"
            >
              {"{ }"} JSX
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('code-block-html', '')}
              title="Code Block (HTML)"
            >
              {"{ }"} HTML
            </Button>

            <div className="border-l border-gray-300" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('link')}
              title="Link"
            >
              <Link size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={insertImage}
              disabled={uploading}
              title="Upload Image"
            >
              {uploading ? <Upload size={16} className="animate-spin" /> : <ImageIcon size={16} />}
            </Button>

            <div className="border-l border-gray-300" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('table')}
              title="Insert Table"
            >
              <Table size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('horizontal-line')}
              title="Horizontal Line"
            >
              ──
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('jsx-component')}
              title="JSX Component"
            >
              &lt;/&gt;
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="mt-0">
          <Textarea
            id="mdx-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your blog content in MDX format. Supports all markdown syntax including tables, code blocks, JSX components, etc."
            className="min-h-[500px] font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className="min-h-[500px] border rounded-lg p-6 bg-white overflow-auto">
            <div className="prose prose-sm md:prose-base prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700 prose-code:text-red-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:shadow-md prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-ol:list-decimal prose-ul:list-disc prose-li:my-0 prose-table:border-collapse prose-table:w-full prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 prose-strong:text-gray-900 prose-em:text-gray-800 max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return inline ? (
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600 font-mono text-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  img: ({ src, alt, ...props }: any) => (
                    <img 
                      src={src} 
                      alt={alt} 
                      {...props} 
                      className="rounded-lg shadow-md max-w-full h-auto my-4"
                    />
                  ),
                  p: ({ children }: any) => {
                    // Convert URLs in text to clickable links
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    
                    const processedChildren = React.Children.map(children, (child: any) => {
                      if (typeof child === 'string') {
                        const parts = child.split(urlRegex);
                        return parts.map((part: string, i: number) => {
                          if (urlRegex.test(part)) {
                            return (
                              <a
                                key={i}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline hover:text-blue-800 break-all"
                              >
                                {part}
                              </a>
                            );
                          }
                          return part;
                        });
                      }
                      return child;
                    });
                    
                    return <p>{processedChildren}</p>;
                  },
                  table: ({ children }: any) => (
                    <div className="overflow-x-auto my-4">
                      <table className="border-collapse w-full border border-gray-300">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }: any) => (
                    <th className="border border-gray-300 bg-gray-100 px-3 py-2 font-bold text-left">
                      {children}
                    </th>
                  ),
                  td: ({ children }: any) => (
                    <td className="border border-gray-300 px-3 py-2">
                      {children}
                    </td>
                  ),
                  blockquote: ({ children }: any) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="font-semibold mb-3 text-blue-900">📝 MDX Syntax Guide - All Supported Formats:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Text Formatting</h4>
            <ul className="space-y-1 text-xs">
              <li><code>**bold text**</code> → <strong>bold text</strong></li>
              <li><code>*italic text*</code> → <em>italic text</em></li>
              <li><code>~~strikethrough~~</code> → <s>strikethrough</s></li>
              <li><code>`inline code`</code> → inline code</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Headings</h4>
            <ul className="space-y-1 text-xs">
              <li><code># Heading 1</code> → h1</li>
              <li><code>## Heading 2</code> → h2</li>
              <li><code>### Heading 3</code> → h3</li>
              <li><code>#### Heading 4</code> → h4</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Lists</h4>
            <ul className="space-y-1 text-xs">
              <li><code>- Item</code> → Bullet list</li>
              <li><code>1. Item</code> → Numbered list</li>
              <li><code>- [ ] Task</code> → Checklist</li>
              <li><code>&gt; Quote</code> → Block quote</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Links & Media</h4>
            <ul className="space-y-1 text-xs">
              <li><code>[text](url)</code> → Link</li>
              <li><code>![alt](url)</code> → Image</li>
              <li><code>---</code> → Horizontal line</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Code Blocks</h4>
            <ul className="space-y-1 text-xs">
              <li><code>```js ... ```</code> → JavaScript</li>
              <li><code>```jsx ... ```</code> → React/JSX</li>
              <li><code>```python ... ```</code> → Python</li>
              <li><code>```html ... ```</code> → HTML</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Colors & Styling</h4>
            <ul className="space-y-1 text-xs">
              <li>Use <strong>Text Color</strong> picker for custom text colors</li>
              <li>Use <strong>Highlight</strong> picker to add background colors</li>
              <li>Select text first, then pick color & click button</li>
              <li>Works with HTML span tags</li>
            </ul>
          </div>
          <div className="lg:col-span-3">
            <h4 className="font-semibold text-blue-900 mb-2">Advanced</h4>
            <ul className="space-y-1 text-xs">
              <li><code>| col1 | col2 |</code> → Tables</li>
              <li><code>&lt;Component&gt;</code> → JSX Components</li>
              <li>Supports GFM (GitHub Flavored Markdown)</li>
              <li>Full MDX syntax supported</li>
            </ul>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
