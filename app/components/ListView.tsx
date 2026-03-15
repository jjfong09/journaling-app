"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { JournalItem } from "@/lib/types";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function CameraIcon({ color }: { color: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <rect x="1.5" y="5.25" width="14" height="10" rx="1.75" stroke={color} strokeWidth="1.35" />
      <circle cx="8.5" cy="10.25" r="2.4" stroke={color} strokeWidth="1.35" />
      <path d="M5.75 5.25L7 3.25h3L11.25 5.25" stroke={color} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PenIcon({ color }: { color: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M12 2.5L14.5 5L6 13.5H3.5V11L12 2.5z" stroke={color} strokeWidth="1.35" strokeLinejoin="round" />
    </svg>
  );
}

export default function ListView({ items }: { items: JournalItem[] }) {
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }));
  }, []);

  return (
    <div>
      {/* Greeting — cream background */}
      <div style={{ padding: "36px var(--px) 28px" }}>
        <p
          style={{
            fontFamily: "var(--font-mono), 'Fragment Mono', monospace",
            fontSize: 14,
            color: "#3d3d3a",
            letterSpacing: "-0.05em",
            marginBottom: 6,
          }}
        >
          {today}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-serif), 'Averia Serif Libre', Georgia, serif",
            fontSize: "clamp(42px, 10vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.04,
            color: "#3d3d3a",
            letterSpacing: "-0.05em",
            maxWidth: "clamp(267px, 55%, 720px)",
          }}
        >
          What&apos;s on your mind today?
        </h1>
      </div>

      {/* White rounded sheet */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "clamp(24px, 4vw, 47px) clamp(24px, 4vw, 47px) 0 0",
          minHeight: 600,
          padding: "28px var(--px) 100px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono), 'Fragment Mono', monospace",
            fontSize: 16,
            color: "#3d3d3a",
            letterSpacing: "-0.8px",
            marginBottom: 20,
            paddingLeft: 9,
          }}
        >
          Recent Entries
        </p>

        {items.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-sans), Inter, sans-serif",
              fontSize: 15,
              color: "#8a7d6e",
              marginTop: 12,
            }}
          >
            No entries yet. Tap + to create a text entry or upload a spread.
          </p>
        ) : (
          <div className="entries-grid">
            {items.map((item) => (
              <ListCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListCard({ item }: { item: JournalItem }) {
  const title = item.type === "entry" ? item.title : item.title;
  const mood = item.type === "entry" ? item.mood : item.mood;
  const date = formatDate(item.entry_date);
  const { color, textColor } = item;
  const isPhoto = item.type === "scrapbook";

  const cardStyle = {
    background: color,
    borderRadius: 22,
    padding: "20px 20px 18px",
    minHeight: 130,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    position: "relative" as const,
  };

  const content = (
    <>
      {/* Entry type icon — top right */}
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          opacity: 0.65,
        }}
      >
        {isPhoto ? (
          <CameraIcon color={textColor} />
        ) : (
          <PenIcon color={textColor} />
        )}
      </div>

      {/* Top: title + badge */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 28 }}>
        <h2
          style={{
            fontFamily: "var(--font-serif), 'Averia Serif Libre', Georgia, serif",
            fontSize: "clamp(20px, 2.5vw, 26px)",
            fontWeight: 400,
            color: textColor,
            letterSpacing: "-0.05em",
            lineHeight: 1.04,
          }}
        >
          {title}
        </h2>
        {mood && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              alignSelf: "flex-start",
              background: "rgba(255,255,255,0.4)",
              color: "#09090b",
              fontFamily: "var(--font-sans), Inter, sans-serif",
              fontSize: 12,
              fontWeight: 500,
              padding: "3px 11px",
              borderRadius: 9999,
              lineHeight: "16px",
            }}
          >
            {mood}
          </span>
        )}
      </div>

      {/* Bottom: date */}
      <p
        style={{
          fontFamily: "var(--font-mono), 'Fragment Mono', monospace",
          fontWeight: 500,
          fontSize: 12,
          color: textColor,
          lineHeight: "16px",
          marginTop: 14,
        }}
      >
        {date}
      </p>
    </>
  );

  if (isPhoto) {
    return (
      <Link href={`/scrapbook/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div className="card-hover" style={cardStyle}>{content}</div>
      </Link>
    );
  }
  return (
    <Link href={`/entries/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="card-hover" style={cardStyle}>{content}</div>
    </Link>
  );
}
