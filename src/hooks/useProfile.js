import { useState, useCallback, useRef } from "react";
import {
  getResolvedAvatar,
  setPresetAvatar, setCustomAvatar,
  getDisplayName, setDisplayName as storeName,
  getInitials, compressAvatar,
} from "../utils/profile";
import { getAvatarSrcById } from "../utils/avatarPack";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_MB = 5;

export default function useProfile() {
  const [savedAvatarSrc, setSavedAvatarSrc] = useState(() => getResolvedAvatar());
  const [savedDisplayName, setSavedDisplayName] = useState(() => getDisplayName());
  const [pendingAvatar, setPendingAvatar] = useState(null);
  const [pendingDisplayName, setPendingDisplayName] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const previewUrlRef = useRef(null);

  const editing = !!pendingAvatar || (pendingDisplayName != null && pendingDisplayName !== savedDisplayName);

  const selectPendingPreset = useCallback((presetId) => {
    const src = getAvatarSrcById(presetId);
    console.log("selectPendingPreset:", presetId, "-> src:", src);
    if (!src) return;
    setUploadError("");
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPendingAvatar({ type: "preset", id: presetId, src });
  }, []);

  const uploadPendingCustom = useCallback((file) => {
    setUploadError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Only PNG, JPG and WEBP images are allowed.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File must be under ${MAX_SIZE_MB} MB.`);
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setPendingAvatar({ type: "custom", file, previewUrl });
  }, []);

  const setPendingName = useCallback((name) => {
    setPendingDisplayName(name);
  }, []);

  const previewAvatarSrc = pendingAvatar
    ? (pendingAvatar.type === "preset" ? pendingAvatar.src : pendingAvatar.previewUrl)
    : savedAvatarSrc;
  const isPending = !!pendingAvatar;

  const saveProfile = useCallback(() => {
    if (pendingAvatar) {
      if (pendingAvatar.type === "preset") {
        setPresetAvatar(pendingAvatar.id);
        setSavedAvatarSrc(pendingAvatar.src);
      } else if (pendingAvatar.type === "custom") {
        compressAvatar(pendingAvatar.file).then((dataUrl) => {
          setCustomAvatar(dataUrl);
          setSavedAvatarSrc(dataUrl);
        });
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPendingAvatar(null);
    }

    if (pendingDisplayName != null && pendingDisplayName !== savedDisplayName) {
      storeName(pendingDisplayName);
      setSavedDisplayName(pendingDisplayName);
    }
    setPendingDisplayName(null);
  }, [pendingAvatar, pendingDisplayName, savedDisplayName]);

  const cancelEditing = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPendingAvatar(null);
    setPendingDisplayName(null);
    setUploadError("");
  }, []);

  const initials = getInitials(savedDisplayName);

  return {
    savedAvatarSrc,
    savedDisplayName,
    previewAvatarSrc,
    isPending,
    pendingAvatar,
    editing,
    selectPendingPreset,
    uploadPendingCustom,
    setPendingName,
    saveProfile,
    cancelEditing,
    uploadError,
    initials,
  };
}
