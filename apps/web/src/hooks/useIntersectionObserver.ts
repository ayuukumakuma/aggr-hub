import { useEffect, useRef, useCallback } from "react";

export function useIntersectionObserver(
  onIntersect: () => void,
  enabled: boolean,
  options?: IntersectionObserverInit,
) {
  const ref = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && enabled) {
        onIntersect();
      }
    },
    [onIntersect, enabled],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      ...options,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, options]);

  return ref;
}
