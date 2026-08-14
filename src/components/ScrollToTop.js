import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* React Router keeps the window scroll across route changes, so following a link from
   halfway down the home page opened /appointment already scrolled past the top. Reset on
   navigation, but leave #hash links alone so in-page anchors still work. */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
};

export default ScrollToTop;
