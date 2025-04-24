'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  newCategoryColor: string;
  setNewCategoryColor: (color: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

export default function AddCategoryDialog({
  open,
  onOpenChange,
  newCategoryName,
  setNewCategoryName,
  newCategoryColor,
  setNewCategoryColor,
  onSubmit,
  isPending,
  error,
  setError,
}: AddCategoryDialogProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    onSubmit();
  };

  if (!mounted) {
    return null; // Prevent rendering until theme is applied
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setError(null);
        setNewCategoryName('');
        setNewCategoryColor('');
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
          <DialogTitle className="text-xl font-semibold">
            Add New Category
          </DialogTitle>
          <div id="dialog-description" className="sr-only">
            Form to add a new category with name and color fields.
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="categoryName" className="text-sm font-medium">
              Category Name
            </Label>
            <Input
              id="categoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              placeholder="Enter category name"
              className="w-full border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              style={{ backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#ffffff' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryColor" className="text-sm font-medium">
              Color
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="categoryColor"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="w-12 h-10 p-1 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-md cursor-pointer"
                style={{ backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#ffffff' }}
              />
              <span
                className="w-10 h-10 rounded-md border border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: newCategoryColor }}
              ></span>
            </div>
          </div>
          {error && <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>}
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}