'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Category } from './page';
import { cn } from '@/lib/utils';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AddNoteDialogProps {
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

export default function AddNoteDialog({
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
}: AddNoteDialogProps) {
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const genAI = googleApiKey ? new GoogleGenerativeAI(googleApiKey) : null;
  const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;
  const [isLoading, setIsLoading] = useState(false);

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
      console.log('Generated Summary:', generatedSummary);
      onSubmit(generatedSummary);
    } catch (err) {
      setError('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const getColorStyle = (color: string) => {
    if (color.startsWith('#')) {
      return { backgroundColor: color };
    }
    return { backgroundColor: `rgb(var(--${color}))` };
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) setError(null); }}>
      <DialogContent
        className={cn(
          'sm:max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-all',
          'animate-in fade-in-90 duration-300'
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Add New Note
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter note title"
              className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </Label>
            <Select
              value={categoryId || 'none'}
              onValueChange={(value) => setCategoryId(value === 'none' ? null : value)}
            >
              <SelectTrigger className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md">
                <SelectItem value="none" className="text-gray-700 dark:text-gray-200">
                  No Category
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-gray-700 dark:text-gray-200">
                    <div className="flex items-center">
                      <span
                        className="inline-block w-3 h-3 mr-2 rounded-full"
                        style={getColorStyle(cat.color)}
                      ></span>
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
              placeholder="Enter note content"
              className="w-full h-32 overflow-y-auto border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-200 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
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