export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
  average_rating?: number;
  total_ratings?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  content: string;
  created_at: string;
}

export interface Rating {
  id: string;
  post_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  created_at: string;
  updated_at?: string;
}

export interface AdminSettings {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at?: string;
  updated_at?: string;
}
