"use client";

import { useState, useRef, useEffect } from "react";

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  background: "#faf9f5",
  border: "1px solid #e6e4dc",
  color: "#3d3d3a",
  fontFamily: "var(--font-sans), Inter, sans-serif",
  fontSize: 13,
  padding: "6px 12px",
  borderRadius: 9999,
  marginRight: 8,
  marginBottom: 8,
};

export default function TagInput({
  value,
  onChange,
  existingTags = [],
  placeholder = "Add a tag…",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  existingTags?: string[];
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = existingTags.filter(
    (t) => t.toLowerCase().includes(input.toLowerCase().trim()) && !value.includes(t)
  );
  const canAddNew = input.trim() && !value.includes(input.trim());

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  useEffect(() => {
    setShowSuggestions(input.length > 0);
  }, [input]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        {value.map((tag) => (
          <span key={tag} style={pillStyle}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="btn-hover"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "#8a7d6e",
                fontSize: 16,
                lineHeight: 1,
              }}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (canAddNew) addTag(input);
              else if (suggestions[0]) addTag(suggestions[0]);
            }
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => input && setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : ""}
          style={{
            flex: "1 1 120px",
            minWidth: 120,
            border: "none",
            background: "transparent",
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: 14,
            color: "#3d3d3a",
            outline: "none",
            padding: "6px 0",
          }}
        />
      </div>

      {showSuggestions && (suggestions.length > 0 || canAddNew) && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            background: "#fff",
            border: "1.5px solid #e6e4dc",
            borderRadius: 12,
            padding: "8px 0",
            zIndex: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {suggestions.slice(0, 5).map((t) => (
            <button
              key={t}
              type="button"
              onMouseDown={() => addTag(t)}
              className="btn-ghost-hover"
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                border: "none",
                background: "none",
                fontFamily: "var(--font-sans), Inter, sans-serif",
                fontSize: 14,
                color: "#3d3d3a",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
          {canAddNew && (
            <button
              type="button"
              onMouseDown={() => addTag(input)}
              className="btn-ghost-hover"
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                border: "none",
                background: "none",
                fontFamily: "var(--font-sans), Inter, sans-serif",
                fontSize: 14,
                color: "#634313",
                cursor: "pointer",
                borderTop: "1px solid #e6e4dc",
              }}
            >
              + Create &quot;{input.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
