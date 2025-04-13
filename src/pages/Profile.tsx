import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Clock, Shield } from 'lucide-react';

function Profile() {
  const { user, updateProfile } = useAuth();
  const { t, i18n } = useTranslation();
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetchLoginHistory();
  }, [user]);

  const fetchLoginHistory = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', user.id)
      .order('login_time', { ascending: false });

    if (!error && data) {
      setLoginHistory(data);
    }
  };

  const handleLanguageChange = async (language: string) => {
    if (language === 'fr') {
      // Implement email verification for French
      // Send OTP email
    } else {
      // Implement phone verification for other languages
      // Send OTP SMS
    }
    
    await i18n.changeLanguage(language);
    await updateProfile({ language_preference: language });
  };

  const obtainLocation = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      // Get location details
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );
      const [locationData] = await response.json();
      
      // Get weather data
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`
      );
      const weatherData = await weatherResponse.json();

      setLocation(locationData);
      setWeather(weatherData);
      
      await updateProfile({
        location: {
          city: locationData.name,
          state: locationData.state,
          country: locationData.country
        }
      });
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={user?.avatar_url || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{user?.email}</h1>
            <p className="text-gray-600">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Language Preference
            </h2>
            <select
              value={user?.language_preference}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="hi">Hindi</option>
              <option value="pt">Portuguese</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </h2>
            <button
              onClick={obtainLocation}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {loading ? 'Getting location...' : 'Obtain Location'}
            </button>
            {location && (
              <div className="mt-2">
                <p>{`${location.name}, ${location.state}, ${location.country}`}</p>
                {weather && (
                  <p className="mt-2">
                    Temperature: {weather.main.temp}°C
                    Weather: {weather.weather[0].main}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Login History
        </h2>
        <div className="space-y-4">
          {loginHistory.map((login) => (
            <div key={login.id} className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">
                    {new Date(login.login_time).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    {login.browser_info.browser} on {login.browser_info.os}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{login.ip_address}</p>
                  {login.location && (
                    <p className="text-sm text-gray-500">
                      {`${login.location.city}, ${login.location.country}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;