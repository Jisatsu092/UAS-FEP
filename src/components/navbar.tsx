'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'User', path: '/users' },
    { name: 'Room Management', path: '/room' },
    { name: 'Booking', path: '/booking' },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <nav className="bg-white shadow-lg relative z-30"> {/* z-30 added */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo dan Menu Desktop */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <svg
                fill="none"
                height="36"
                viewBox="0 0 32 32"
                width="36"
                className="text-blue-600"
              >
                <path
                  clipRule="evenodd"
                  d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-800 hidden md:block">
                Room Manager
              </span>
            </Link>

            {/* Menu Items Desktop */}
            <div className="hidden md:flex space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'hover:text-blue-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Dropdown */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setIsProfileOpen(false);
                }}
                className="hidden md:flex items-center p-2 rounded-full hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M22 22L20 20"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-40"> {/* z-40 added */}
                  <input
                    type="text"
                    placeholder="Cari form..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border-b focus:outline-none"
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {filteredMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          pathname === item.path ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsSearchOpen(false);
                }}
                className="flex items-center space-x-1 focus:outline-none"
              >
                <img
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  className="w-8 h-8 rounded-full"
                  alt="Profile"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-40"> {/* z-40 added */}
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold">John Doe</p>
                    <p className="text-xs text-gray-600">john@example.com</p>
                  </div>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/logout"
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger Menu Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-3 space-y-1 bg-white border-t z-40"> {/* z-40 added */}
            <div className="mb-2">
              <input
                type="text"
                placeholder="Cari form..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <svg
                className="w-5 h-5 absolute left-6 top-2.5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M22 22L20 20"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>

            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setSearchQuery('');
                }}
                className={`block px-3 py-2 text-sm font-medium ${
                  pathname === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}