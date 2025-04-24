'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { Notebook } from 'lucide-react';
import Header from './Header';
import Filters from './Filters';
import NoteCard from './NoteCard';
import AddNoteDialog from './AddNoteDialog';
import EditNoteDialog from './EditNoteDialog';
import AddCategoryDialog from './AddCategoryDialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  user_id: string;
  category_id: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export default function Notes() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [editNoteOpen, setEditNoteOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#FF0000');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newNoteId, setNewNoteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        setError('Please sign in to view notes');
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (newNoteId) {
      const timer = setTimeout(() => {
        setNewNoteId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newNoteId]);

  // Reset currentPage to 1 on filter or pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, pageSize]);

  const { data: notesData, error: notesError, isPending: isNotesPending } = useQuery({
    queryKey: ['notes', search, selectedCategory, currentPage, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('notes')
        .select('id, title, content, summary, user_id, category_id, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (search) query = query.ilike('title', `%${search}%`);
      if (selectedCategory && selectedCategory !== 'all')
        query = query.eq('category_id', selectedCategory);

      const { data, error, count } = await query;
      if (error) throw new Error(error.message);
      return { notes: data as Note[], total: count || 0 };
    },
  });

  // Adjust currentPage if it exceeds totalPages
  useEffect(() => {
    if (notesData && notesData.total > 0) {
      const totalPages = Math.ceil(notesData.total / pageSize);
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    }
  }, [notesData, pageSize]);

  const { data: categories, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentication failed');

      const { data: userCategories, error: userCategoriesError } = await supabase
        .from('categories')
        .select('id, name, color, user_id')
        .eq('user_id', user.id);

      const { data: defaultCategories, error: defaultCategoriesError } = await supabase
        .from('categories')
        .select('id, name, color, user_id')
        .is('user_id', null);

      if (userCategoriesError) throw new Error(userCategoriesError.message);
      if (defaultCategoriesError) throw new Error(defaultCategoriesError.message);

      const combinedCategories = [
        ...(userCategories || []),
        ...(defaultCategories || []),
      ] as Category[];
      return combinedCategories.sort((a, b) => a.name.localeCompare(b.name));
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ summary }: { summary: string }) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentication failed');
      if (!title.trim() || !content.trim())
        throw new Error('Title and content are required');

      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            summary: summary.trim() || null,
            user_id: user.id,
            category_id: categoryId,
          },
        ])
        .select()
        .single();
      if (error) throw new Error(`Failed to add note: ${error.message}`);
      return data;
    },
    onSuccess: (data: Note) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setAddNoteOpen(false);
      setTitle('');
      setContent('');
      setCategoryId(null);
      setError(null);
      setNewNoteId(data.id);
      setCurrentPage(1); // Reset to page 1 on new note
    },
    onError: (err: Error) => setError(err.message),
  });

  const editNoteMutation = useMutation({
    mutationFn: async ({ summary }: { summary: string }) => {
      if (!editingNote) throw new Error('No note selected');
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentication failed');
      if (!title.trim() || !content.trim())
        throw new Error('Title and content are required');

      const { data, error } = await supabase
        .from('notes')
        .update({
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim() || null,
          category_id: categoryId,
        })
        .eq('id', editingNote.id)
        .select()
        .single();
      if (error) throw new Error(`Failed to edit note: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditNoteOpen(false);
      setTitle('');
      setContent('');
      setCategoryId(null);
      setEditingNote(null);
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);
      if (error) throw new Error(`Failed to delete note: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      // Page adjustment is handled by the useEffect
    },
    onError: (err: Error) => setError(err.message),
  });

  const addCategoryMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentication failed');
      if (!newCategoryName.trim()) throw new Error('Category name is required');

      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: newCategoryName.trim(),
            color: newCategoryColor,
            user_id: user.id,
          },
        ])
        .select()
        .single();
      if (error) throw new Error(`Failed to add category: ${error.message}`);
      return data;
    },
    onSuccess: (data: Category) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategoryOpen(false);
      setNewCategoryName('');
      setNewCategoryColor('#FF0000');
      setCategoryId(data.id);
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategoryId(note.category_id);
    setEditNoteOpen(true);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (notesError || categoriesError) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        Error: {notesError?.message || categoriesError?.message}
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  const displayedCategories = categories || [];
  const notes = notesData?.notes || [];
  const totalNotes = notesData?.total || 0;
  const totalPages = Math.ceil(totalNotes / pageSize);

  return (
    <div className="container mx-auto p-4">
      <Header />
      <Filters
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={displayedCategories}
        onAddCategory={() => setNewCategoryOpen(true)}
        setAddNoteOpen={setAddNoteOpen}
      />
      {isNotesPending ? (
        <div className="flex justify-center items-center min-h-[50vh] text-gray-500 dark:text-gray-400">
          <p className="text-xl font-semibold">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <Notebook className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No notes yet</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Get started by adding your first note!
          </p>
          <button
            onClick={() => setAddNoteOpen(true)}
            className="mt-4 text-blue-600 hover:underline cursor-pointer"
          >
            Add your first note
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                categories={categories}
                summary={note.summary || undefined}
                onEdit={openEditNote}
                onDelete={() => deleteNoteMutation.mutate(note.id)}
                isDeleting={deleteNoteMutation.isPending}
                isNew={note.id === newNoteId}
              />
            ))}
          </div>
          {totalNotes > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="border-gray-200 dark:border-gray-600 cursor-pointer dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentPage === totalPages || totalPages === 0}
                className="border-gray-200 dark:border-gray-600 cursor-pointer dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Next
              </Button>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-32 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Notes per page" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="4">4 per page</SelectItem>
                  <SelectItem value="8">8 per page</SelectItem>
                  <SelectItem value="12">12 per page</SelectItem>
                  <SelectItem value="16">16 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}
      <AddNoteDialog
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categories={displayedCategories}
        onSubmit={(summary) => addNoteMutation.mutate({ summary })}
        isPending={addNoteMutation.isPending}
        error={error}
        setError={setError}
      />
      <EditNoteDialog
        open={editNoteOpen}
        onOpenChange={setEditNoteOpen}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categories={displayedCategories}
        onSubmit={(summary) => editNoteMutation.mutate({ summary })}
        isPending={editNoteMutation.isPending}
        error={error}
        setError={setError}
      />
      <AddCategoryDialog
        open={newCategoryOpen}
        onOpenChange={setNewCategoryOpen}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryColor={newCategoryColor}
        setNewCategoryColor={setNewCategoryColor}
        onSubmit={() => addCategoryMutation.mutate()}
        isPending={addCategoryMutation.isPending}
        error={error}
        setError={setError}
      />
    </div>
  );
}