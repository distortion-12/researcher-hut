export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  author?: string;
  author_id?: string;
  is_published: boolean;
  is_approved: boolean;
  created_at: string;
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
