// ============================================================
// AVATAR PACK — 8 preset avatars for SpendSmart
// ============================================================
// To update an image: replace the file in public/avatars/
// and update the src path below. No other files need to change.
// ============================================================

export const AVATAR_PACK = [
  {
    id: "minimal-male",
    name: "Modern Male",
    src: "/avatars/avatar-1-modern-male.png",
  },
  {
    id: "minimal-female",
    name: "Modern Female",
    src: "/avatars/avatar-2-modern-female.png",
  },
  {
    id: "cyber-blue",
    name: "Male with Glasses",
    src: "/avatars/avatar-3-male-glasses.png",
  },
  {
    id: "emerald-finance",
    name: "Female with Glasses",
    src: "/avatars/avatar-4-female-glasses.png",
  },
  {
    id: "anime-male",
    name: "Professional Male",
    src: "/avatars/avatar-5-professional-male.png",
  },
  {
    id: "anime-female",
    name: "Professional Female",
    src: "/avatars/avatar-6-professional-female.png",
  },
  {
    id: "friendly-robot",
    name: "AI Robot",
    src: "/avatars/avatar-7-ai-robot.png",
  },
  {
    id: "abstract",
    name: "Abstract",
    src: "/avatars/avatar-8-abstract.png",
  },
];

export function getAvatarSrcById(id) {
  return AVATAR_PACK.find((a) => a.id === id)?.src || null;
}
