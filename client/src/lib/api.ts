const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// Posts API
export const postsApi = {
  getAll: () => fetchApi<any[]>('/posts'),
  getAllAdmin: () => fetchApi<any[]>('/posts/admin/all'),
  getPending: () => fetchApi<any[]>('/posts/admin/pending'),
  getUserPosts: (userId: string) => fetchApi<any[]>(`/posts/user/${userId}`),
  getBySlug: (slug: string) => fetchApi<any>(`/posts/slug/${slug}`),
  getById: (id: string) => fetchApi<any>(`/posts/admin/${id}`),
  search: (query: string) => fetchApi<any[]>(`/posts/search?q=${encodeURIComponent(query)}`),
  create: (data: any) => fetchApi<any>('/posts', { method: 'POST', body: data }),
  createUserPost: (data: any) => fetchApi<any>('/posts/user', { method: 'POST', body: data }),
  update: (id: string, data: any) => fetchApi<any>(`/posts/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => fetchApi<any>(`/posts/${id}`, { method: 'DELETE' }),
  togglePublish: (id: string, is_published: boolean) => 
    fetchApi<any>(`/posts/${id}/publish`, { method: 'PATCH', body: { is_published } }),
  approvePost: (id: string) => fetchApi<any>(`/posts/${id}/approve`, { method: 'PATCH' }),
  rejectPost: (id: string) => fetchApi<any>(`/posts/${id}/reject`, { method: 'DELETE' }),
};

// Comments API
export const commentsApi = {
  getByPostId: (postId: string) => fetchApi<any[]>(`/comments/${postId}`),
  create: (postId: string, data: any) => 
    fetchApi<any>(`/comments/${postId}`, { method: 'POST', body: data }),
  delete: (id: string) => fetchApi<any>(`/comments/${id}`, { method: 'DELETE' }),
};

// Ratings API
export const ratingsApi = {
  getByPostId: (postId: string) => fetchApi<any>(`/ratings/${postId}`),
  getUserRating: (postId: string, userId: string) => 
    fetchApi<any>(`/ratings/${postId}/user/${userId}`),
  upsert: (postId: string, data: any) => 
    fetchApi<any>(`/ratings/${postId}`, { method: 'POST', body: data }),
};

// Auth API
export const authApi = {
  getAdminSettings: () => fetchApi<any>('/auth/admin/settings'),
  sendAdminOtp: (email: string) => 
    fetchApi<any>('/auth/admin/send-otp', { method: 'POST', body: { email } }),
  verifyAdminLogin: (data: any) => 
    fetchApi<any>('/auth/admin/verify', { method: 'POST', body: data }),
  sendResetOtp: (email: string) => 
    fetchApi<any>('/auth/admin/reset/send-otp', { method: 'POST', body: { email } }),
  resetCredentials: (data: any) => 
    fetchApi<any>('/auth/admin/reset', { method: 'POST', body: data }),
  // User signup with OTP
  sendSignupOtp: (data: { email: string; name: string; username: string; password: string }) =>
    fetchApi<any>('/auth/signup/send-otp', { method: 'POST', body: data }),
  verifySignupOtp: (data: { email: string; otp: string }) =>
    fetchApi<any>('/auth/signup/verify', { method: 'POST', body: data }),
  // Email change with OTP
  sendEmailChangeOtp: (data: { userId: string; currentEmail: string; newEmail: string }) =>
    fetchApi<any>('/auth/email/send-otp', { method: 'POST', body: data }),
  verifyEmailChange: (data: { userId: string; otp: string }) =>
    fetchApi<any>('/auth/email/verify', { method: 'POST', body: data }),
};

// Users API
export const usersApi = {
  checkUsername: (username: string) => fetchApi<{ available: boolean }>(`/users/check-username/${username}`),
  getById: (id: string) => fetchApi<any>(`/users/${id}`),
  create: (data: any) => fetchApi<any>('/users', { method: 'POST', body: data }),
  update: (id: string, data: { name?: string; username?: string; profile_picture?: string }) => 
    fetchApi<any>(`/users/${id}`, { method: 'PUT', body: data }),
  checkUsernameChangeStatus: (id: string) => 
    fetchApi<{ allowed: boolean; daysRemaining: number; lastChangedAt?: string }>(`/users/${id}/username-change-status`),
};

