import { useState, useEffect } from "react";

function generateUID() {
  return "user_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export default function useUser() {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    let stored = localStorage.getItem("spendsmart_uid");
    if (!stored) {
      stored = generateUID();
      localStorage.setItem("spendsmart_uid", stored);
    }
    setUid(stored);
  }, []);

  return { uid, displayName: "User" };
}