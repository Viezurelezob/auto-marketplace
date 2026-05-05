const KEY = 'rv_cars';
const MAX = 10;

export function useRecentlyViewed() {
  const getAll = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  };

  const add = (listing) => {
    if (!listing?.id) return;
    const items = getAll().filter((i) => i.id !== listing.id);
    items.unshift({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      currency: listing.currency,
      image: listing.images?.[0] || null,
      brand: listing.brand,
      year: listing.year,
      location: listing.location,
    });
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  };

  return { getAll, add };
}
