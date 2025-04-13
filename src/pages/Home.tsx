import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, Video } from 'lucide-react';

function Home() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">{t('welcome')}, {user?.email}</h1>
        <p className="text-lg opacity-90">Connect, share, and learn with our community.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/public-space" className="transform hover:scale-105 transition-transform">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <Users className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Public Space</h2>
            <p className="text-gray-600">Connect with others and share your thoughts</p>
          </div>
        </Link>

        <Link to="/ask-question" className="transform hover:scale-105 transition-transform">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <MessageSquare className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ask Questions</h2>
            <p className="text-gray-600">Get help from the community</p>
          </div>
        </Link>

        <Link to="/profile" className="transform hover:scale-105 transition-transform">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <Video className="w-12 h-12 text-purple-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
            <p className="text-gray-600">Manage your account and settings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Home;