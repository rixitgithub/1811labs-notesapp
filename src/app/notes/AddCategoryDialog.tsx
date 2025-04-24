'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils'; // Shadcn/UI utility for conditional class names

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) setError(null); }}>
      <DialogContent
        className={cn(
          'sm:max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-all',
          'animate-in fade-in-90 duration-300' // Smooth fade-in animation
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Add New Category
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="categoryName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category Name
            </Label>
            <Input
              id="categoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              placeholder="Enter category name"
              className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryColor" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Color
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="categoryColor"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="w-12 h-10 p-1 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 cursor-pointer"
              />
              <span
                className="w-10 h-10 rounded-md border border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: newCategoryColor }}
              ></span>
            </div>
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