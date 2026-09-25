import { useRef, useEffect } from "react";
import { haptics } from "../utils/haptics";

export default function useGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 60,
  enabled = true,
}) {
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const ref = useRef(null);
  const callbacksRef = useRef({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown });
  useEffect(() => {
    callbacksRef.current = { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown };
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const handleTouchStart = (e) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      touchEnd.current = null;
    };

    const handleTouchMove = (e) => {
      touchEnd.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = () => {
      if (!touchStart.current || !touchEnd.current) return;

      const dx = touchEnd.current.x - touchStart.current.x;
      const dy = touchEnd.current.y - touchStart.current.y;
      const dt = Date.now() - touchStart.current.time;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Must be fast enough (swipe, not scroll)
      if (dt > 400) return;

      const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown } = callbacksRef.current;

      if (absDx > absDy && absDx > threshold) {
        haptics.light();
        if (dx < 0 && onSwipeLeft) onSwipeLeft();
        else if (dx > 0 && onSwipeRight) onSwipeRight();
      } else if (absDy > absDx && absDy > threshold) {
        haptics.light();
        if (dy < 0 && onSwipeUp) onSwipeUp();
        else if (dy > 0 && onSwipeDown) onSwipeDown();
      }

      touchStart.current = null;
      touchEnd.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [threshold, enabled]);

  return ref;
}