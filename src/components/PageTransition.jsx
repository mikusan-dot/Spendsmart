import { useState, useEffect, useRef } from "react";

export default function PageTransition({ children, tabKey }) {
  const [phase, setPhase] = useState("active");
  const prevKey = useRef(tabKey);
  const timerRef = useRef(null);

  useEffect(() => {
    if (prevKey.current === tabKey) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("exit");
    timerRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        setPhase("enter");
        requestAnimationFrame(() => {
          setPhase("active");
          prevKey.current = tabKey;
        });
      });
    }, 180);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tabKey]);

  const styles = {
    active: "opacity-100 translate-y-0 translate-x-0 scale-100",
    enter: "opacity-0 translate-y-4 scale-95",
    exit: "opacity-0 -translate-y-2 scale-95",
  };

  return (
    <div
      className={`transition-all duration-200 ease-out ${styles[phase]}`}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </div>
  );
}