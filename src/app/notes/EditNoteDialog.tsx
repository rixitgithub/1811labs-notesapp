'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Category } from './page';
import { cn } from '@/lib/utils';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTheme } from 'next-themes';

interface EditNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  categoryId: string | null;
  setCategoryId: (categoryId: string | null) => void;
  categories: Category[];
  onSubmit: (summary: string) => void;
  isPending: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

export default function EditNoteDialog({
  open,
  onOpenChange,
  title,
  setTitle,
  content,
  setContent,
  categoryId,
  setCategoryId,
  categories,
  onSubmit,
  isPending,
  error,
  setError,
}: EditNoteDialogProps) {
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const genAI = googleApiKey ? new GoogleGenerativeAI(googleApiKey) : null;
  const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;
  const [isLoading, setIsLoading] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Sync theme with localStorage and debug
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme && storedTheme !== theme) {
      setTheme(storedTheme); // Sync theme with localStorage
    }
  }, [theme, resolvedTheme, setTheme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!model) {
      setError('Summarization unavailable: Google API key is missing');
      setIsLoading(false);
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      setIsLoading(false);
      return;
    }

    try {
      const prompt = `Summarize the following text in 2-3 sentences:\n\n${content}`;
      const result = await model.generateContent(prompt);
      const generatedSummary = result.response.text();
      onSubmit(generatedSummary);
    } catch {
      setError('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const getColorStyle = (color: string) => {
    if (color.startsWith('#')) {
      return { className: '', style: { backgroundColor: color } };
    }
    const colorMap: { [key: string]: string } = {
      red: 'bg-red-500 dark:bg-red-600',
      blue: 'bg-blue-500 dark:bg-blue-600',
      green: 'bg-green-500 dark:bg-green-600',
      yellow: 'bg-yellow-500 dark:bg-yellow-600',
    };
    return { className: colorMap[color.toLowerCase()] || 'bg-gray-500 dark:bg-gray-600', style: {} };
  };

  if (!mounted) {
    return null; // Prevent rendering until theme is applied
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setError(null);
        setTitle('');
        setContent('');
        setCategoryId(null);
      }
    }}>
      <DialogContent
        className={cn(
          'sm:max-w-md bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg transition-all',
          'animate-in fade-in-90 duration-300'
        )}
        style={{ backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#ffffff' }}
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold ">
            Edit Note
          </DialogTitle>
          <div id="dialog-description" className="sr-only">
            Form to edit a note with title, category, and content fields.
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter note title"
              className="w-full border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              style={{ backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#ffffff' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select
              value={categoryId || 'none'}
              onValueChange={(value) => setCategoryId(value === 'none' ? null : value)}
            >
              <SelectTrigger
                className="w-full border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                style={{ backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#ffffff' }}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-md"
                style={{ backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#ffffff' }}
              >
                <SelectItem value="none" className="text-gray-900 dark:text-gray-100">
                  No Category
                </SelectItem>
                {categories.map((cat) => {
                  const { className, style } = getColorStyle(cat.color);
                  return (
                    <SelectItem key={cat.id} value={cat.id} className="text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <span
                          className={cn('inline-block w-3 h-3 mr-2 rounded-full', className)}
                          style={style}
                        ></span>
                        {cat.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
              placeholder="Enter note content"
              className="w-full h-32 overflow-y-auto border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              style={{ backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#ffffff' }}
            />
          </div>
          {error && <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>}
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              type="submit"
              disabled={isLoading || isPending}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              {isLoading || isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}