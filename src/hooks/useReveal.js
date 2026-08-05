import { useEffect } from 'react';

/* Scroll-reveal: adds `is-in` to every `.dp-reveal` as it enters the viewport.
   Falls back to showing everything when IntersectionObserver is unavailable,
   and is a no-op for visitors who prefer reduced motion (CSS handles that). */
const useReveal = (deps = []) => {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.dp-reveal:not(.is-in)'));
    if (!nodes.length) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach((n) => n.classList.add('is-in'));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useReveal;
