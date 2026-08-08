import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router doesn't reset scroll position on navigation — without this,
// clicking a link while scrolled down (e.g. a footer Quick Link) lands on
// the new page still scrolled to wherever the previous page left off.
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
