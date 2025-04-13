import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Image, Video, Heart, MessageCircle, Share2 } from 'lucide-react';

function PublicSpace() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users (
          email,
          avatar_url
        ),
        comments (
          *,
          users (
            email,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    setPosts(data);
  };

  const handlePost = async () => {
    if (!user) return;

    // Check posting restrictions based on friend count
    const { data: userData } = await supabase
      .from('users')
      .select('friend_count')
      .eq('id', user.id)
      .single();

    const postsToday = posts.filter(
      post => 
        post.user_id === user.id && 
        new Date(post.created_at).toDateString() === new Date().toDateString()
    ).length;

    if (userData.friend_count === 0 && postsToday >= 1) {
      setError('You can only post once per day with no friends');
      return;
    } else if (userData.friend_count < 10 && postsToday >= userData.friend_count) {
      setError(`You can only post ${userData.friend_count} times per day with your current friend count`);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content,
        media_url: media?.url,
        media_type: media?.type
      });

      if (error) throw error;

      setContent('');
      setMedia(null);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      await supabase
        .from('posts')
        .update({ likes: (post.likes || 0) + 1 })
        .eq('id', postId);
      
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 border rounded-lg mb-4"
          rows={3}
        />
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button className="flex items-center text-gray-600 hover:text-blue-500">
              <Image className="w-5 h-5 mr-2" />
              Photo
            </button>
            <button className="flex items-center text-gray-600 hover:text-blue-500">
              <Video className="w-5 h-5 mr-2" />
              Video
            </button>
          </div>
          
          <button
            onClick={handlePost}
            disabled={loading || !content}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <img
                src={post.users.avatar_url || 'https://via.placeholder.com/40'}
                alt="Avatar"
                className="w-10 h-10 rounded-full mr-4"
              />
              <div>
                <p className="font-semibold">{post.users.email}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="mb-4">{post.content}</p>

            {post.media_url && (
              <div className="mb-4">
                {post.media_type === 'image' ? (
                  <img src={post.media_url} alt="Post media" className="rounded-lg" />
                ) : (
                  <video src={post.media_url} controls className="rounded-lg" />
                )}
              </div>
            )}

            <div className="flex items-center space-x-4 text-gray-500">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center hover:text-blue-500"
              >
                <Heart className="w-5 h-5 mr-1" />
                {post.likes || 0}
              </button>
              
              <button className="flex items-center hover:text-blue-500">
                <MessageCircle className="w-5 h-5 mr-1" />
                {post.comments?.length || 0}
              </button>
              
              <button className="flex items-center hover:text-blue-500">
                <Share2 className="w-5 h-5 mr-1" />
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublicSpace;