import { useEffect, useRef, type RefObject } from 'react';

// Calls onOutside when a mouse press lands outside panelRef (and outside any
// element matching ignoreSelector — the toggle button that opens the panel
// handles its own open/close in its onClick).
//
// The listener is registered once, in the capture phase, and reads the latest
// onOutside through a ref. Re-registering whenever onOutside changes (it's
// usually an inline arrow) breaks real clicks: another document-level
// mousedown handler (ChatsTab's clearSearch) sets state, React re-renders in
// the microtask that runs right after that handler, and the effect swaps this
// listener mid-dispatch — the new one isn't invoked for the in-flight event.
// Synthetic dispatchEvent() calls don't hit this because no microtask
// checkpoint runs between listeners, which is why it only fails for a user.
export function useOutsidePress(
  panelRef: RefObject<HTMLElement | null>,
  onOutside: () => void,
  ignoreSelector?: string,
) {
  const onOutsideRef = useRef(onOutside);
  useEffect(() => {
    onOutsideRef.current = onOutside;
  });

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (ignoreSelector && target instanceof Element && target.closest(ignoreSelector)) return;
      onOutsideRef.current();
    };
    document.addEventListener('mousedown', handlePointerDown, true);
    return () => document.removeEventListener('mousedown', handlePointerDown, true);
  }, [panelRef, ignoreSelector]);
}
