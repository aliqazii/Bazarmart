import { useCallback, useRef } from "react";

const useScrollReveal = (options = {}) => {
  const observerRef = useRef(null);

  const ref = useCallback((el) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || "0px" }
    );

    observer.observe(el);
    observerRef.current = observer;
  }, [options.threshold, options.rootMargin]);

  return ref;
};

export default useScrollReveal;
