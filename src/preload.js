// Warm the browser cache so images are decoded before they are needed
// (no pop-in when cards reshuffle, no stall when the win/lose panel opens).
const seen = new Set();

export function preloadImages(urls) {
  urls.forEach((url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    img.decode?.().catch(() => {}); // decode off the main thread where supported
  });
}

// Run low-priority work when the browser is idle (Safari has no requestIdleCallback).
export function whenIdle(fn) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 4000 });
  else setTimeout(fn, 1500);
}
