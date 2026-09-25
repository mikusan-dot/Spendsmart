import { getAvatarSrcById } from "./avatarPack";

const AVATAR_TYPE_KEY = "ss_avatar_type"; // "preset" | "custom" | null
const AVATAR_DATA_KEY = "ss_avatar_data"; // preset id or base64 data url
const NAME_KEY = "ss_display_name";

// --- Avatar type/data ---

export function getAvatarType() {
  return localStorage.getItem(AVATAR_TYPE_KEY) || null;
}

export function getAvatarData() {
  return localStorage.getItem(AVATAR_DATA_KEY) || null;
}

export function setPresetAvatar(presetId) {
  localStorage.setItem(AVATAR_TYPE_KEY, "preset");
  localStorage.setItem(AVATAR_DATA_KEY, presetId);
}

export function setCustomAvatar(dataUrl) {
  localStorage.setItem(AVATAR_TYPE_KEY, "custom");
  localStorage.setItem(AVATAR_DATA_KEY, dataUrl);
}

export function clearAvatar() {
  localStorage.removeItem(AVATAR_TYPE_KEY);
  localStorage.removeItem(AVATAR_DATA_KEY);
}

/**
 * Returns the resolved avatar src (URL/data URI) or null.
 * For preset avatars, resolves the ID to the pack's src.
 */
export function getResolvedAvatar() {
  const type = getAvatarType();
  const data = getAvatarData();
  if (!type || !data) return null;
  if (type === "preset") return getAvatarSrcById(data);
  if (type === "custom") return data;
  return null;
}

/**
 * Legacy compat: returns the resolved avatar src.
 * Keeps backward-compatible `getAvatar()` name.
 */
export const getAvatar = getResolvedAvatar;

// --- Display name ---

export function getDisplayName() {
  return localStorage.getItem(NAME_KEY) || null;
}

export function setDisplayName(name) {
  if (name && name.trim()) {
    localStorage.setItem(NAME_KEY, name.trim());
  } else {
    localStorage.removeItem(NAME_KEY);
  }
}

// --- Initials ---

export function getInitials(name) {
  if (!name || name === "User") return "A";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// --- Image compression ---

export function compressAvatar(file, maxSize = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxSize) { h = (h * maxSize) / w; w = maxSize; }
        } else {
          if (h > maxSize) { w = (w * maxSize) / h; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
