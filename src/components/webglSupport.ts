let _cachedSupport: boolean | undefined;

export function supportsWebGL(): boolean {
  if (_cachedSupport !== undefined) return _cachedSupport;

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    _cachedSupport = false;
    return false;
  }

  try {
    const canvas = document.createElement('canvas');

    _cachedSupport = Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl') ||
          (typeof WebGL2RenderingContext !== 'undefined' &&
            canvas.getContext('webgl2')))
    );
  } catch {
    _cachedSupport = false;
  }

  return _cachedSupport;
}
