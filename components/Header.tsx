'use client';

import { useState, useEffect, useRef } from 'react';
import { DateTime } from 'luxon';
// Real-time New York time component
function NYTime() {
  const [now, setNow] = useState(() => DateTime.now().setZone('America/New_York'));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(DateTime.now().setZone('America/New_York'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Example: "Wed, 24 Jan 2026 - 09:32:15 AM ET"
  const formatted = now.toFormat("ccc, dd LLL yyyy - hh:mm:ss a 'ET'");
  return (
    <span
      className="hidden sm:inline ml-3 text-xs font-medium text-gray-400 select-none font-mono"
      style={{
        letterSpacing: '0.01em',
        minWidth: 210,
        maxWidth: 210,
        display: 'inline-block',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
      }}
      aria-label="New York time"
    >
      {formatted}
    </span>
  );
}
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import AuthModal from './AuthModal';

interface Category {
  _id: string;
  name: string;
  slug: string;
  showInHeader?: boolean;
  isMainHeader?: boolean;
}

interface NavItem {
  _id: string;
  name: string;
  href: string;
  order: number;
  isActive: boolean;
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: { name: string; slug: string };
  author: { name: string };
  createdAt: string;
}

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  // isMoreDropdownOpen: false | 'blog' | 'more'
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState<false | 'blog' | 'more'>(false);
  const [headerCategories, setHeaderCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [subHeaderCategories, setSubHeaderCategories] = useState<Category[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (searchQuery.trim()) {
        router.push(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
        setIsSearchDropdownOpen(false);
      }
    }
  };

  // Search functionality
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const params = new URLSearchParams();
          params.append('search', searchQuery.trim());
          params.append('limit', '5');
          params.append('status', 'published');

          const response = await fetch(`/api/cms/posts?${params}`);
          const data = await response.json();

          if (data.success) {
            setSearchResults(data.data);
            setIsSearchDropdownOpen(true);
          }
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      } else {
        setSearchResults([]);
        setIsSearchDropdownOpen(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        if (isMoreDropdownOpen) setIsMoreDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch header categories and nav items
  useEffect(() => {
    async function fetchMainHeaderCategories() {
      try {
        const response = await fetch('/api/categories/header');
        if (response.ok) {
          const data = await response.json();
          setHeaderCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch main header categories:', error);
      }
    }

    async function fetchAllCategories() {
      try {
        const response = await fetch('/api/cms/categories');
        if (response.ok) {
          const data = await response.json();
          setAllCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch all categories:', error);
      }
    }

    async function fetchSubHeaderCategories() {
      try {
        const response = await fetch('/api/categories/subheader');
        if (response.ok) {
          const data = await response.json();
          setSubHeaderCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch sub header categories:', error);
      }
    }

    async function fetchNavItems() {
      try {
        const response = await fetch('/api/admin/nav');
        if (response.ok) {
          const data = await response.json();
          setNavItems(data.navItems);
        }
      } catch (error) {
        console.error('Failed to fetch nav items:', error);
      }
    }

    // Fetch immediately on mount
    fetchMainHeaderCategories();
    fetchAllCategories();
    fetchSubHeaderCategories();
    fetchNavItems();

    // Set up interval to fetch every 10 seconds
    const interval = setInterval(() => {
      fetchMainHeaderCategories();
      fetchAllCategories();
      fetchSubHeaderCategories();
      fetchNavItems();
    }, 10000);

    return () => clearInterval(interval);
  }, []);



  return (
    <>


      <header className="fixed top-0 left-0 w-full z-50" style={{ background: 'transparent' }}>
        {/* TOP HEADER */}
        <div className="glass" style={{
          position: 'relative',
          width: '100%',
          margin: 0,
          padding: 0,
          boxShadow: 'var(--glass-shadow)',
          borderRadius: 0,
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          background: 'rgba(5, 5, 7, 0.97)',
        }}>
          <div className="w-full px-4 py-3 relative flex items-center justify-center">
            {/* NY Time right-aligned absolute */}
            <div className="hidden md:flex items-center absolute right-4 top-1/2 -translate-y-1/2">
              <NYTime />
            </div>
            {/* Centered Logo (remains visually centered) */}
            <div className="flex items-center justify-center w-full">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold justify-center w-full" style={{ color: '#fff', letterSpacing: '-0.5px' }}>
                <img src="/logos/header-2.PNG" alt="Logo2" className="h-8 w-auto mr-2" style={{ display: 'inline-block' }} />
                <span className="hidden md:inline">THEMARKETSTORIES</span>
              </Link>
              {/* Hamburger for mobile (absolute right) */}
              <button
                className="md:hidden flex items-center px-2 py-1 text-white focus:outline-none absolute right-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Open menu"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col md:hidden" style={{backdropFilter:'blur(2px)'}}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <Link href="/" className="text-xl font-bold" style={{ color: '#fff', letterSpacing: '-0.5px' }}>
                THEMARKETSTORIES
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="text-white p-2">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="flex flex-col gap-2 px-4 py-4">
              <Link href="/markets" className="py-2 text-white" onClick={()=>setIsMobileMenuOpen(false)}>Markets</Link>
              <Link href="/brokers" className="py-2 text-white" onClick={()=>setIsMobileMenuOpen(false)}>Brokers</Link>
              <Link href="/tools" className="py-2 text-white" onClick={()=>setIsMobileMenuOpen(false)}>Tools</Link>
              <Link href="/learn" className="py-2 text-white" onClick={()=>setIsMobileMenuOpen(false)}>Learn</Link>
              <Link href="/blog" className="py-2 text-white" onClick={()=>setIsMobileMenuOpen(false)}>Blog</Link>
              <Link href="/screener" className="py-2 text-white" onClick={()=>setIsMobileMenuOpen(false)}>Screener</Link>
              <Link href="/about" className="py-2 text-white" onClick={()=>setIsMobileMenuOpen(false)}>About</Link>
              <Link href="/contact" className="py-2 text-white" onClick={()=>setIsMobileMenuOpen(false)}>Contact</Link>
              <Link href="/terms" className="py-2 text-white" onClick={()=>setIsMobileMenuOpen(false)}>Terms & Conditions</Link>
              <Link href="/privacy" className="py-2 text-white" onClick={()=>setIsMobileMenuOpen(false)}>Privacy Policy</Link>
              <Link href="/subscription" className="py-2 text-white" onClick={()=>setIsMobileMenuOpen(false)}>Subscription</Link>
              {session?.user ? (
                <button onClick={()=>{signOut(); setIsMobileMenuOpen(false);}} className="py-2 text-white text-left">Logout</button>
              ) : (
                <>
                  <button onClick={()=>{setIsAuthModalOpen(true); setIsMobileMenuOpen(false);}} className="py-2 text-white text-left">Sign In</button>
                  <button onClick={()=>{setIsAuthModalOpen(true); setIsMobileMenuOpen(false);}} className="py-2 text-white text-left">Free Sign Up</button>
                </>
              )}
            </nav>
          </div>
        )}

        {/* MAIN NAV */}
        <div className="glass hidden md:block" style={{
          margin: 0,
          borderRadius: 0,
          boxShadow: 'none',
          padding: 0,
          background: 'rgba(36,36,40,0.96)',
        }}>
          <div className="w-full px-4 py-2">
            <nav className="flex items-center justify-between text-sm" style={{ color: '#ccc' }}>
              <div className="flex items-center justify-between w-full">
                {/* LEFT: Static Navigation */}
                <div className="flex gap-5 items-center whitespace-nowrap flex-1 min-w-0">
                  <Link href="/markets" className="glass-hover shrink-0" style={{ color: '#fff', fontWeight: 500 }}>Markets</Link>
                  <Link href="/brokers" className="glass-hover shrink-0" style={{ color: '#fff', fontWeight: 500 }}>Brokers</Link>
                  <Link href="/tools" className="glass-hover shrink-0" style={{ color: '#fff', fontWeight: 500 }}>Tools</Link>
                  <Link href="/learn" className="glass-hover shrink-0" style={{ color: '#fff', fontWeight: 500 }}>Learn</Link>
                  <Link href="/screener" className="glass-hover shrink-0" style={{ color: '#fff', fontWeight: 500 }}>Screener</Link>
                  <div className="relative">
                    <button
                      className="glass-hover shrink-0 flex items-center gap-1"
                      style={{ color: '#fff', fontWeight: 500 }}
                      onClick={() => setIsMoreDropdownOpen(isMoreDropdownOpen === 'blog' ? false : 'blog')}
                    >
                      Blog <ChevronDown size={16} />
                    </button>
                    {isMoreDropdownOpen === 'blog' && (
                      <div
                        className="absolute left-0 top-full mt-2 w-56 glass shadow-lg z-50"
                        style={{ background: 'rgba(36,36,40,0.97)', color: '#fff' }}
                        onMouseLeave={() => setIsMoreDropdownOpen(false)}
                      >
                        <Link href="/blog" className="block px-4 py-2 text-sm glass-hover" style={{ color: '#fff' }} onClick={() => setIsMoreDropdownOpen(false)}>
                          All Blog Posts
                        </Link>
                        <div className="border-t border-gray-700 my-1" />
                        {allCategories.length === 0 && (
                          <div className="px-4 py-2 text-xs text-gray-400">No categories</div>
                        )}
                        {allCategories.map(category => (
                          <Link
                            key={category._id}
                            href={`/category/${category.slug}`}
                            className="block px-4 py-2 text-sm glass-hover"
                            style={{ color: '#fff' }}
                            onClick={() => setIsMoreDropdownOpen(false)}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      className="glass-hover shrink-0 flex items-center gap-1"
                      style={{ color: '#fff', fontWeight: 500 }}
                      onClick={() => setIsMoreDropdownOpen(isMoreDropdownOpen === 'more' ? false : 'more')}
                    >
                      More <ChevronDown size={16} />
                    </button>
                    {isMoreDropdownOpen === 'more' && (
                      <div
                        className="absolute left-0 top-full mt-2 w-48 glass shadow-lg z-50"
                        style={{ background: 'rgba(36,36,40,0.97)', color: '#fff' }}
                        onMouseLeave={() => setIsMoreDropdownOpen(false)}
                      >
                        <Link href="/about" className="block px-4 py-2 text-sm glass-hover" style={{ color: '#fff' }} onClick={() => setIsMoreDropdownOpen(false)}>
                          About
                        </Link>
                        <Link href="/contact" className="block px-4 py-2 text-sm glass-hover" style={{ color: '#fff' }} onClick={() => setIsMoreDropdownOpen(false)}>
                          Contact
                        </Link>
                        <Link href="/terms" className="block px-4 py-2 text-sm glass-hover" style={{ color: '#fff' }} onClick={() => setIsMoreDropdownOpen(false)}>
                          Terms & Conditions
                        </Link>
                        <Link href="/privacy" className="block px-4 py-2 text-sm glass-hover" style={{ color: '#fff' }} onClick={() => setIsMoreDropdownOpen(false)}>
                          Privacy Policy
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                {/* RIGHT: Search and Actions */}
                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <div className="relative" ref={searchRef}>
                    <div className="flex items-center glass" style={{ padding: '0.25rem 0.75rem', background: 'rgba(24,24,28,0.85)' }}>
                      <Search size={14} className="mr-2" style={{ color: '#bbb' }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search..."
                        className="bg-transparent text-sm outline-none w-36"
                        style={{ color: '#fff', fontWeight: 500, letterSpacing: '-0.2px' }}
                      />
                    </div>
                    {isSearchDropdownOpen && searchResults.length > 0 && (
                      <div className="absolute right-0 top-full mt-1 w-80 glass z-50 max-h-96 overflow-y-auto" style={{ background: 'rgba(36,36,40,0.98)', color: '#fff', boxShadow: 'var(--glass-shadow)' }}>
                        {searchResults.map((post) => (
                          <Link
                            key={post._id}
                            href={`/${post.category.slug}/${post.slug}`}
                            className="block px-4 py-3 glass-hover"
                            style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                            onClick={() => setIsSearchDropdownOpen(false)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium truncate" style={{ color: '#fff' }}>
                                  {post.title}
                                </h4>
                                <p className="text-xs mt-1 line-clamp-2" style={{ color: '#bbb' }}>
                                  {post.excerpt}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs" style={{ color: '#90cdf4', background: '#1a2233', borderRadius: 8, padding: '0.1rem 0.5rem' }}>
                                    {post.category.name}
                                  </span>
                                  <span className="text-xs" style={{ color: '#aaa' }}>
                                    by {post.author.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                        <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          <Link
                            href={`/blog?search=${encodeURIComponent(searchQuery)}`}
                            className="text-sm glass-hover"
                            style={{ color: '#90cdf4' }}
                            onClick={() => setIsSearchDropdownOpen(false)}
                          >
                            View all results -&gt;
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Actions */}
                  <button className="glass glass-hover px-3 py-1.5 font-medium" style={{ color: '#fff', background: 'rgba(36,36,40,0.92)' }}>
                    Upgrade
                  </button>
                  {session?.user ? (
                    <div className="relative" ref={profileDropdownRef}>
                      <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="flex items-center gap-2 glass-hover"
                        style={{ color: '#fff' }}
                      >
                        <span>{session.user.name}</span>
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt="Profile"
                            className="w-8 h-8 rounded-full"
                            style={{ background: '#222' }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                            {session.user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <ChevronDown size={16} />
                      </button>
                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 glass shadow-lg z-50" style={{ background: 'rgba(36,36,40,0.97)', color: '#fff' }}>
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm glass-hover"
                            style={{ color: '#fff' }}
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Profile
                          </Link>
                          {session.user.role === 'admin' ? (
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-sm glass-hover"
                              style={{ color: '#fff' }}
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              Admin Dashboard
                            </Link>
                          ) : (
                            <Link
                              href="/dashboard"
                              className="block px-4 py-2 text-sm glass-hover"
                              style={{ color: '#fff' }}
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              Dashboard
                            </Link>
                          )}
                          <Link
                            href="/subscription"
                            className="block px-4 py-2 text-sm glass-hover"
                            style={{ color: '#fff' }}
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Subscription
                          </Link>
                          <button
                            onClick={() => {
                              signOut();
                              setIsProfileDropdownOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm glass-hover"
                            style={{ color: '#fff' }}
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-4 py-2 text-white focus:outline-none"
                        style={{ background: 'transparent', borderRadius: 0, boxShadow: 'none' }}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-4 py-2 text-white focus:outline-none"
                        style={{ background: 'transparent', borderRadius: 0, boxShadow: 'none' }}
                      >
                        Free Sign Up
                      </button>
                    </>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* SUB NAV */}
        <div className="glass" style={{
          margin: 0,
          borderRadius: 0,
          boxShadow: 'none',
          padding: 0,
          background: 'rgba(24,24,28,0.92)',
        }}>
          <div className="w-full px-4 py-2 overflow-x-auto">
            <nav className="flex gap-5 text-xs whitespace-nowrap" style={{ color: '#bbb' }}>
              {subHeaderCategories.map(category => (
                <Link
                  key={category._id}
                  href={`/category/${category.slug}`}
                  className="glass-hover"
                  style={{ color: '#fff', fontWeight: 500 }}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
