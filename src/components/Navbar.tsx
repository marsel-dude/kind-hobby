import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Users, Calendar, User, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAvatar } from '../contexts/AvatarContext';
import { useGreeting } from '../utils/greeting';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { avatarUrl, updateAvatar } = useAvatar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const greeting = useGreeting(displayName);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('avatar_url, display_name, is_admin')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      updateAvatar(data?.avatar_url);
      setDisplayName(data?.display_name || '');
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="text-primary w-8 h-8" />
            <span className="text-xl font-bold">KindHobby</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/groups" className="nav-link">
              <Users className="w-5 h-5" />
              <span>Groups</span>
            </Link>
            <Link to="/events" className="nav-link">
              <Calendar className="w-5 h-5" />
              <span>Events</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3"
                >
                  <span className="text-gray-600 hidden lg:block">{greeting}</span>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-500 lg:hidden">
                      {greeting}
                    </div>
                    
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/signup" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}