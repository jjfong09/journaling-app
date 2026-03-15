"use client";

import { FormEvent, useMemo, useState } from "react";

type UploadState = {
  status: "idle" | "uploading" | "success" | "error";
  message: string;
};

export default function ScrapbookUploader() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [file, setFile] = useState<File | null>(null);
  const [entryDate, setEntryDate] = useState(today);
  const [state, setState] = useState<UploadState>({
    status: "idle",
    message: "",
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setState({ status: "error", message: "Choose an image first." });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("entryDate", entryDate);
    setState({ status: "uploading", message: "Removing background..." });

    try {
      const res = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.details || json?.error || "Upload failed.");
      }
      setState({
        status: "success",
        message: "Upload complete! Loading your spread...",
      });
      setFile(null);
      window.location.reload();
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Upload failed.",
      });
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "1rem",
        display: "grid",
        gap: "0.75rem",
      }}
    >
      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
          Journal spread image
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
      </label>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
          Entry date
        </span>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          required
        />
      </label>

      <button
        type="submit"
        disabled={state.status === "uploading"}
        style={{
          width: "fit-content",
          padding: "0.55rem 0.9rem",
          border: "1px solid var(--border)",
          borderRadius: 6,
          background: state.status === "uploading" ? "#f1f1f1" : "white",
          cursor: state.status === "uploading" ? "wait" : "pointer",
        }}
      >
        {state.status === "uploading" ? "Processing..." : "Upload spread"}
      </button>

      {state.message ? (
        <p
          style={{
            fontSize: "0.9rem",
            color: state.status === "error" ? "#b00020" : "var(--muted)",
          }}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
