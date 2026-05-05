import { useEffect } from 'react';

export function usePageMeta({ title, description, image } = {}) {
  useEffect(() => {
    const prev = document.title;
    if (title) document.title = title;

    const setMeta = (property, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:image', image);
    setMeta('og:url', window.location.href);
    setMeta('og:type', 'website');

    return () => { document.title = prev; };
  }, [title, description, image]);
}
