import { useEffect, useRef, useState } from 'react';

export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? '');
  const activeIdRef = useRef<string>(sectionIds[0] ?? '');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const ratios: Record<string, number> = Object.fromEntries(
      sectionIds.map((id) => [id, 0])
    );

    // Ensure we have a sensible default (top/first section)
    if (sectionIds[0] && !activeIdRef.current) {
      activeIdRef.current = sectionIds[0];
      setActiveId(sectionIds[0]);
    }

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            ratios[id] = entry.intersectionRatio;
          });

          // Find section with highest intersection ratio (stable + deterministic)
          let maxId = sectionIds[0] ?? '';
          let maxRatio = maxId ? ratios[maxId] ?? 0 : 0;

          for (const currentId of sectionIds) {
            const ratio = ratios[currentId] ?? 0;
            if (ratio > maxRatio) {
              maxRatio = ratio;
              maxId = currentId;
            }
          }

          if (maxId && maxRatio > 0.1 && activeIdRef.current !== maxId) {
            activeIdRef.current = maxId;
            setActiveId(maxId);
          }
        },
        {
          threshold: [0, 0.25, 0.5, 0.75, 1],
          rootMargin: '-20% 0px -20% 0px', // Focus on center 60% of viewport
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [sectionIds]);

  return activeId;
}
