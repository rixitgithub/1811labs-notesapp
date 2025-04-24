'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Category } from './page';
import { useCallback, useEffect, useState } from 'react';

interface FiltersProps {
  search: string;
  setSearch: (search: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  categories: Category[];
  onAddCategory: () => void;
  setAddNoteOpen: (open: boolean) => void;
}

export default function Filters({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  onAddCategory,
  setAddNoteOpen,
}: FiltersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getColorStyle = useCallback((color: string) => {
    if (color.startsWith('#')) {
      return { backgroundColor: color };
    }
    return { backgroundColor: 'hsl(var(--primary))' };
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col space-y-4 mb-8 items-center w-full">
        <div className="w-full max-w-sm h-10 rounded-lg bg-[hsl(var(--card))] animate-pulse border border-[hsl(var(--border))]" />
        <div className="w-full max-w-sm h-10 rounded-lg bg-[hsl(var(--card))] animate-pulse border border-[hsl(var(--border))]" />
        <div className="w-full max-w-sm h-10 rounded-lg bg-[hsl(var(--card))] animate-pulse border border-[hsl(var(--border))]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 mb-8 items-center w-full sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
      <Input
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--secondary))] dark:hover:bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] transition-all duration-200 ease-in-out"
      />
      <div className="flex flex-col space-y-4 w-full max-w-sm sm:flex-row sm:space-y-0 sm:space-x-2 sm:w-auto">
        <Select
          value={selectedCategory || 'all'}
          onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full max-w-sm sm:w-48 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--secondary))] dark:hover:bg-[hsl(var(--muted))] transition-all duration-200 ease-in-out cursor-pointer">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--card-foreground))] rounded-lg max-h-60">
            <SelectItem
              value="all"
              className="hover:bg-[hsl(var(--secondary))] dark:hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--accent-foreground))] transition-colors duration-150"
            >
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 mr-2 rounded-full bg-[hsl(var(--muted))]"></span>
                All Categories
              </div>
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem
                key={cat.id}
                value={cat.id}
                className="hover:bg-[hsl(var(--secondary))] dark:hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--accent-foreground))] transition-colors duration-150"
              >
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
        <Button
          onClick={onAddCategory}
          variant="outline"
          className="w-full max-w-sm sm:w-38 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))] hover:opacity-90 rounded-lg transition-all duration-200 ease-in-out cursor-pointer"
          aria-label="Add new category"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>
      <Button
        onClick={() => setAddNoteOpen(true)}
        className="w-full max-w-sm sm:w-38 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))] hover:opacity-90 rounded-lg transition-all duration-200 ease-in-out cursor-pointer"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Note
      </Button>
    </div>
  );
}