import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { messagesAPI } from '../services/api.js';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());

  useEffect(() => {
    if (!user) { setIds(new Set()); return; }
    api.get('/favorites/ids')
      .then((r) => setIds(new Set(r.data)))
      .catch(() => {});
  }, [user]);

  const toggle = useCallback(async (listingId) => {
    if (!user) return false;
    const res = await api.post(`/favorites/${listingId}`);
    setIds((prev) => {
      const next = new Set(prev);
      res.data.favorited ? next.add(listingId) : next.delete(listingId);
      return next;
    });
    return res.data.favorited;
  }, [user]);

  const isFav = useCallback((id) => ids.has(id), [ids]);

  return (
    <FavoritesContext.Provider value={{ ids, toggle, isFav, count: ids.size }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
