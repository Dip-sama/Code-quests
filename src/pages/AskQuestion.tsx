import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Upload, AlertCircle, Check } from 'lucide-react';

function AskQuestion() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questionsToday, setQuestionsToday] = useState(0);
  const [userPlan, setUserPlan] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserPlan();
      fetchQuestionsToday();
    }
  }, [user]);

  useEffect(() => {
    // Check video upload time restrictions (2 PM to 7 PM)
    const currentHour = new Date().getHours();
    if (currentHour < 14 || currentHour >= 19) {
      setError('Video uploads are only allowed between 2 PM and 7 PM');
    }
  }, []);

  const fetchUserPlan = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_plan')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setUserPlan(data.subscription_plan);
    }
  };

  const fetchQuestionsToday = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('questions')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    if (!error) {
      setQuestionsToday(data.length);
    }
  };

  const checkQuestionLimit = () => {
    const limits = {
      'free': 1,
      'bronze': 5,
      'silver': 10,
      'gold': Infinity
    };

    const limit = limits[userPlan || 'free'];
    return questionsToday >= limit;
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('Video size must be less than 50MB');
      return;
    }

    // Check video duration
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      if (video.duration > 120) { // 2 minutes
        setError('Video must be less than 2 minutes long');
        return;
      }
      setVideo(file);
      setError('');
    };

    video.src = URL.createObjectURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkQuestionLimit()) {
      setError('You have reached your daily question limit');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Send OTP for video upload
      if (video) {
        // Implement email OTP verification
        // await sendOTP(user.email);
      }

      let videoUrl = null;
      if (video) {
        const fileName = `${user.id}/${Date.now()}-${video.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('question-videos')
          .upload(fileName, video);

        if (uploadError) throw uploadError;
        videoUrl = uploadData.path;
      }

      const { error: questionError } = await supabase
        .from('questions')
        .insert({
          user_id: user.id,
          title,
          content,
          video_url: videoUrl
        });

      if (questionError) throw questionError;

      setSuccess('Question posted successfully!');
      setTitle('');
      setContent('');
      setVideo(null);
      fetchQuestionsToday();
    } catch (err) {
      setError('Failed to post question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Ask a Question</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
            <Check className="w-5 h-5 inline mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {(userPlan === 'silver' || userPlan === 'gold') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="video-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a video</span>
                      <input
                        id="video-upload"
                        name="video-upload"
                        type="file"
                        accept="video/*"
                        className="sr-only"
                        onChange={handleVideoChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    MP4, WebM up to 50MB (2 minutes max)
                  </p>
                </div>
              </div>
              {video && (
                <p className="mt-2 text-sm text-green-600">
                  <Check className="w-4 h-4 inline mr-1" />
                  {video.name}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Questions today: {questionsToday} / {userPlan === 'gold' ? '∞' : {
                'free': 1,
                'bronze': 5,
                'silver': 10
              }[userPlan || 'free']}
            </p>
            <button
              type="submit"
              disabled={loading || checkQuestionLimit()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AskQuestion;