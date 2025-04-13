import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Mail, Key, AlertCircle, Check } from 'lucide-react';

function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generatePassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const length = 12;
    
    let password = '';
    let hasUpper = false;
    let hasLower = false;

    // Ensure at least one uppercase and one lowercase
    password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    hasUpper = true;
    hasLower = true;

    // Fill the rest of the password
    while (password.length < length) {
      const useUpper = Math.random() < 0.5;
      const chars = useUpper ? uppercaseChars : lowercaseChars;
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    setGeneratedPassword(password);
  };

  const checkResetLimit = async (email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('password_reset_count, password_reset_last_date')
      .eq('email', email)
      .single();

    if (error) return false;

    const today = new Date().toISOString().split('T')[0];
    
    if (data.password_reset_last_date === today && data.password_reset_count >= 1) {
      setError('You can only request a password reset once per day');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const canReset = await checkResetLimit(email);
      if (!canReset) {
        setLoading(false);
        return;
      }

      const newPassword = generatedPassword || undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
        password: newPassword // If generated password is used
      });

      if (error) throw error;

      // Update reset count and date
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('users')
        .update({
          password_reset_count: 1,
          password_reset_last_date: today
        })
        .eq('email', email);

      setSuccess(
        generatedPassword
          ? `Password has been reset to: ${generatedPassword}`
          : 'Password reset instructions have been sent to your email'
      );

      // Clear form
      setEmail('');
      setGeneratedPassword('');

      // Redirect after a delay if using generated password
      if (generatedPassword) {
        setTimeout(() => navigate('/login'), 5000);
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address to receive reset instructions
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <Check className="w-5 h-5 inline mr-2" />
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={generatePassword}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <Key className="h-4 w-4 mr-1" />
              Generate Password
            </button>
          </div>

          {generatedPassword && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <p className="text-sm text-gray-600">Generated Password:</p>
              <p className="mt-1 font-mono text-sm">{generatedPassword}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;