import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Home, User, LogOut, LogIn, HelpCircle, Users, CreditCard } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <Menu className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">Q&A Platform</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/public-space" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
              <Users className="h-5 w-5" />
              <span>Public Space</span>
            </Link>
            <Link to="/ask-question" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
              <HelpCircle className="h-5 w-5" />
              <span>Ask Question</span>
            </Link>
            <Link to="/subscription" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
              <CreditCard className="h-5 w-5" />
              <span>Subscription</span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
                <LogIn className="h-5 w-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;