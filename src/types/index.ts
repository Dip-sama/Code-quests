export interface User {
  id: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  last_login?: string;
  browser_info?: {
    browser: string;
    os: string;
    device: string;
  };
  ip_address?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  friend_count: number;
  subscription_plan?: 'free' | 'bronze' | 'silver' | 'gold';
  subscription_end_date?: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  created_at: string;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface LoginHistory {
  id: string;
  user_id: string;
  login_time: string;
  browser_info: {
    browser: string;
    os: string;
    device: string;
  };
  ip_address: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
}