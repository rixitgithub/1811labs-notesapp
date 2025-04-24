'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Note, Category } from './page';
import { cn } from '@/lib/utils';
import { Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface NoteCardProps {
  note: Note;
  categories: Category[] | undefined;
  summary: string | undefined;
  onEdit: (note: Note) => void;
  onDelete: () => void;
  isDeleting: boolean;
  isNew?: boolean;
}

export default function NoteCard({
  note,
  categories,
  summary,
  onEdit,
  onDelete,
  isDeleting,
  isNew = false,
}: NoteCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const category = categories?.find((cat) => cat.id === note.category_id);
  const createdAt = note.created_at ? format(new Date(note.created_at), 'MMM d, yyyy') : 'Unknown';

  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target instanceof Element) || !e.target.closest('button')) {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <Card
        className={cn(
          'relative bg-card rounded-xl rounded-tr-none p-6 border border-border shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer',
          'bg-gradient-to-br from-primary/10 to-secondary/10 overflow-visible flex flex-col',
          isNew && 'animate-pulse border-2 border-primary',
          'w-full max-w-sm mx-auto'
        )}
        onClick={handleCardClick}
      >
        {category && (
          <div
            className="absolute top-0 right-0 w-16 h-16 rounded-bl-full transition-transform duration-200"
            style={{ backgroundColor: category.color }}
            title={category.name}
            aria-label={`Category: ${category.name}`}
          />
        )}
        <CardHeader className="px-0 relative">
          <div>
            <CardTitle className="text-2xl font-bold text-accent-foreground tracking-tight">
              {note.title}
            </CardTitle>
            {category && (
              <div className="flex items-center gap-2 mt-3">
                <span
                  className="inline-block w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-foreground">{category.name}</span>
              </div>
            )}
          </div>
          <p className="absolute bottom-0 right-0 text-xs text-muted-foreground pr-2 pb-2 z-10">
            Created: {createdAt}
          </p>
        </CardHeader>
        <hr className="border-t border-border w-full mt-[-10px]" />
        <CardContent className="px-0 pb-0 flex flex-col flex-grow">
          <p className="text-base text-foreground mb-4 line-clamp-3 leading-relaxed">
            {note.content}
          </p>
          {summary && (
            <div className="mb-4">
              <span className="text-sm font-semibold text-primary">Summary:</span>
              <p className="text-sm text-primary italic">{summary}</p>
            </div>
          )}
          <div className="flex flex-row gap-2 mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(note)}
              className="flex-1 flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 border-none font-semibold transition-colors duration-200 cursor-pointer"
              aria-label="Edit note"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="flex-1 flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 border-none font-semibold transition-colors duration-200 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed cursor-pointer"
              aria-label="Delete note"
            >
              <Trash className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={cn(
            'sm:max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-all',
            'animate-in fade-in-90 duration-300'
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {note.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {category && (
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">{category.name}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">Created: {createdAt}</p>
            {summary && (
              <div>
                <span className="text-sm font-semibold text-blue-500 dark:text-blue-400">Summary:</span>
                <p className="text-sm text-blue-500 dark:text-blue-400 italic">{summary}</p>
              </div>
            )}
            <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">{note.content}</p>
          </div>
          <DialogFooter className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-200 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}