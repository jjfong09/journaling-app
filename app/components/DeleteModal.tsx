"use client";

import { useEffect } from "react";

export default function DeleteModal({
  label,
  onConfirm,
  onCancel,
}: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 200,
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 201,
          background: "#fff",
          borderRadius: 16,
          padding: "32px 28px 24px",
          width: "min(92vw, 380px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-serif), 'Averia Serif Libre', Georgia, serif",
            fontSize: 20,
            fontWeight: 600,
            color: "#1a1a1a",
            margin: 0,
          }}
        >
          Delete {label}?
        </p>
        <p
          style={{
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: 14,
            color: "#8a7d6e",
            margin: "4px 0 20px",
          }}
        >
          This can&apos;t be undone.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onConfirm}
            className="btn-danger-hover"
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              border: "none",
              background: "#c53030",
              color: "#fff",
              fontFamily: "var(--font-sans), Inter, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="btn-hover"
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              border: "1px solid #e6e4dc",
              background: "none",
              color: "#3d3d3a",
              fontFamily: "var(--font-sans), Inter, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
