import { useCallback, useEffect, useState } from 'react';

const INTRO_SEEN_KEY = 'topology-intro-seen';

export function useIntroGate() {
  const [shouldShowIntro, setShouldShowIntro] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!sessionStorage.getItem(INTRO_SEEN_KEY)) {
      setShouldShowIntro(true);
    }
  }, []);

  const markIntroDone = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    }
    setShouldShowIntro(false);
  }, []);

  const resetIntro = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(INTRO_SEEN_KEY);
    }
    setShouldShowIntro(true);
  }, []);

  return {
    shouldShowIntro,
    markIntroDone,
    resetIntro,
  };
}
