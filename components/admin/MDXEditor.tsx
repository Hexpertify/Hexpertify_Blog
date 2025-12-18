'use client';

import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading, List, Link, Image as ImageIcon, Code, Upload } from 'lucide-react';

interface MDXEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MDXEditor({ value, onChange }: MDXEditorProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // Use server-side upload endpoint which securely uses Vercel Blob
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
    if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      // For local development, prompt for URL
      const url = prompt('Enter image URL (image upload is only available in production):', 'https://example.com/image.jpg');
      if (url) {
        const alt = prompt('Enter alt text for the image:', 'Blog image') || 'Blog image';
        insertMarkdown('image', url, alt);
      }
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

  const insertMarkdown = (syntax: string, placeholder: string = '', alt?: string) => {
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
      case 'list':
        newText = `\n- ${selectedText}`;
        cursorOffset = selectedText ? newText.length : 3;
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
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('bold', 'bold text')}
              title="Bold"
            >
              <Bold size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('italic', 'italic text')}
              title="Italic"
            >
              <Italic size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('heading', 'Heading')}
              title="Heading"
            >
              <Heading size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('list', 'List item')}
              title="List"
            >
              <List size={16} />
            </Button>
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
              title={process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV ? "Upload Image" : "Insert Image URL (upload only in production)"}
            >
              {uploading ? <Upload size={16} className="animate-spin" /> : <ImageIcon size={16} />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertMarkdown('code', 'code')}
              title="Code"
            >
              <Code size={16} />
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="mt-0">
          <Textarea
            id="mdx-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your blog content in MDX format..."
            className="min-h-[500px] font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className="min-h-[500px] border rounded-lg p-6 bg-white prose max-w-none">
            <div
              className="prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-purple-600 prose-img:rounded-lg"
              dangerouslySetInnerHTML={{
                __html: value
                  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                  .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />')
                  .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
                  .replace(/`(.*?)`/g, '<code>$1</code>')
                  .replace(/^- (.*$)/gim, '<li>$1</li>')
                  .replace(/\n/g, '<br />')
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-gray-500">
        <p className="font-semibold mb-2">MDX Syntax Guide:</p>
        <ul className="space-y-1 text-xs">
          <li>**bold text** for <strong>bold</strong></li>
          <li>*italic text* for <em>italic</em></li>
          <li>## Heading for headings</li>
          <li>- List item for lists</li>
          <li>[link text](url) for links</li>
          <li>![alt text](image-url) for images</li>
          <li>`code` for inline code</li>
        </ul>
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
