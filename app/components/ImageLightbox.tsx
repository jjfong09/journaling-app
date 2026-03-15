"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ImageLightboxProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

const lightboxContent = (src: string, alt: string, onClose: () => void) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="View image"
    onClick={onClose}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(0,0,0,0.95)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
    }}
  >
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="btn-hover"
      style={{
        position: "absolute",
        top: "max(16px, env(safe-area-inset-top))",
        right: "max(16px, env(safe-area-inset-right))",
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.15)",
        color: "#fff",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 24,
        lineHeight: 1,
        zIndex: 1,
      }}
    >
      ×
    </button>
    <img
      src={src}
      alt={alt}
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
      }}
    />
  </div>
);

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(lightboxContent(src, alt, onClose), document.body);
}
