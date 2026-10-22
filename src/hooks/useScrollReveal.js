import { useEffect, useRef } from 'react';

// Hook: reveal elements on scroll
export function useScrollReveal(className = 'reveal') {
  const ref = useRef(null);

  useEffect(() => {
    const elements = document.querySelectorAll(`.${className}`);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [className]);

  return ref;
}
