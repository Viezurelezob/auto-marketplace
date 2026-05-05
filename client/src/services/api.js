import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) localStorage.removeItem('token');
    return Promise.reject(err);
  }
);

export const listingsAPI = {
  getAll:          (params)    => api.get('/listings', { params }),
  getById:         (id)        => api.get(`/listings/${id}`),
  getMine:         ()          => api.get('/listings/mine'),
  create:          (data)      => api.post('/listings', data),
  update:          (id, data)  => api.put(`/listings/${id}`, data),
  delete:          (id)        => api.delete(`/listings/${id}`),
  markSold:        (id)        => api.patch(`/listings/${id}/sold`),
  promote:         (id)        => api.patch(`/listings/${id}/featured`),
  getRelated:      (id)        => api.get(`/listings/${id}/related`),
  renew:           (id)        => api.patch(`/listings/${id}/renew`),
  getPriceHistory: (id)        => api.get(`/listings/${id}/price-history`),
};

export const adminAPI = {
  getStats:   ()         => api.get('/admin/stats'),
  getListings:(params)   => api.get('/admin/listings', { params }),
  getUsers:   ()         => api.get('/admin/users'),
  setStatus:  (id, status) => api.patch(`/admin/listings/${id}/status`, { status }),
  setPremium: (id, data) => api.patch(`/admin/listings/${id}/premium`, data),
  delete:     (id)       => api.delete(`/admin/listings/${id}`),
};

export const uploadAPI = {
  images: (formData) =>
    api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const paymentsAPI = {
  createCheckout: (data) => api.post('/payments/create-checkout', data),
};

export const profileAPI = {
  update: (data) => api.put('/auth/profile', data),
};

export const sellersAPI = {
  getById: (id) => api.get(`/sellers/${id}`),
};

export const reviewsAPI = {
  getBySeller: (sellerId) => api.get(`/sellers/${sellerId}/reviews`),
  create: (sellerId, data) => api.post(`/sellers/${sellerId}/reviews`, data),
};

export const reportsAPI = {
  create: (listingId, reason) => api.post(`/listings/${listingId}/report`, { reason }),
};

export const savedSearchesAPI = {
  getAll:  ()           => api.get('/saved-searches'),
  create:  (data)       => api.post('/saved-searches', data),
  delete:  (id)         => api.delete(`/saved-searches/${id}`),
};

export const favoritesAPI = {
  getIds:   ()   => api.get('/favorites/ids'),
  toggle:   (id) => api.post(`/favorites/${id}`),
  getAll:   ()   => api.get('/favorites'),
};

export const messagesAPI = {
  getUnread:            ()   => api.get('/messages/unread'),
  getConversations:     ()   => api.get('/messages/conversations'),
  getOrCreate:          (listingId) => api.post('/messages/conversations', { listingId }),
  getConversation:      (id) => api.get(`/messages/conversations/${id}`),
  send:                 (id, content) => api.post(`/messages/conversations/${id}`, { content }),
};

export default api;
