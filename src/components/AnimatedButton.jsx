import { useState } from "react";
import { haptics } from "../utils/haptics";

export default function AnimatedButton({
  children,
  onClick,
  className = "",
  style = {},
  hapticType = "light",
  disabled = false,
  variant = "default", // eslint-disable-line no-unused-vars -- reserved for future use
}) {
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  const handlePress = (e) => {
    if (disabled) return;

    // Haptic
    haptics[hapticType]?.();

    // Ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);

    onClick?.();
  };

  return (
    <button
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => { setPressed(false); }}
      onClick={handlePress}
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        transform: pressed ? "scale(0.95)" : "scale(1)",
        transition: "transform 0.1s cubic-bezier(0.34, 1.56, 0.64, 1)",
        ...style,
      }}
    >
      {/* Ripple */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none rounded-full bg-white/20 animate-ping"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
            animationDuration: "0.6s",
            animationIterationCount: 1,
          }}
        />
      ))}
      {children}
    </button>
  );
}