import { createContext, useContext, useState } from 'react';

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [items, setItems] = useState([]);

  const isInCompare = (id) => items.some((i) => i.id === id);

  const add = (listing) => {
    if (items.length >= 3 || isInCompare(listing.id)) return;
    setItems((prev) => [...prev, {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      currency: listing.currency,
      image: listing.images?.[0] || null,
      brand: listing.brand,
      year: listing.year,
    }]);
  };

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  const toggle = (listing) => isInCompare(listing.id) ? remove(listing.id) : add(listing);

  return (
    <CompareContext.Provider value={{ items, add, remove, clear, isInCompare, toggle }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
