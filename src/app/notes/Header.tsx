'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js'; // Add this import at the top of the file
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';

export default function Header() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
        setUser(null);
      } else {
        setUser(user);
      }
    };
    fetchUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      setUser(null);
      setIsDropdownOpen(false); // Close dropdown on sign out
      router.push('/'); // Redirect to homepage
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  
  const isEmailSignIn = user?.identities?.some((identity) => identity.provider === 'email');
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Notes Summarizer - Intern Assignment</h1>
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        {user && (
          <div className="relative" ref={dropdownRef}>
            <Image
              src={isEmailSignIn ? '/default.svg' : user?.user_metadata?.picture}
              width={32}
              height={32}
              alt="User Avatar"
              className="w-8 h-8 rounded-full object-cover cursor-pointer"
              referrerPolicy="no-referrer"
              onClick={toggleDropdown}
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                <button
                  onClick={handleSignOut}
                  className="block w-full min-w-[120px] text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}