"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { JournalItem } from "@/lib/types";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getMonthAbbr(dateStr: string) {
  return new Date(dateStr + "T12:00:00")
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}>
      <path d="M12 3H17V8" stroke="#8a7d6e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 3L11 9" stroke="#8a7d6e" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 17H3V12" stroke="#8a7d6e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17L9 11" stroke="#8a7d6e" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Shared card header: title + date + optional mood tag */
function CardHeader({
  title,
  date,
  mood,
}: {
  title: string;
  date: string;
  mood?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingRight: 30,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <h2
          style={{
            fontFamily: "var(--font-serif), 'Averia Serif Libre', Georgia, serif",
            fontSize: 20,
            fontWeight: 400,
            color: "#634313",
            letterSpacing: "-1px",
            lineHeight: 1.04,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-mono), 'Fragment Mono', monospace",
            fontWeight: 500,
            fontSize: 10,
            color: "#634313",
            lineHeight: "13.4px",
          }}
        >
          {date}
        </p>
      </div>

      {mood && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            alignSelf: "flex-start",
            background: "#faf9f5",
            color: "#09090b",
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: 10,
            fontWeight: 500,
            padding: "2.5px 9px",
            borderRadius: 9999,
            lineHeight: "13.4px",
          }}
        >
          {mood}
        </span>
      )}
    </div>
  );
}

const SCALE_MIN = 0.86;

export default function SpreadView({ items }: { items: JournalItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardScales, setCardScales] = useState<number[]>(() =>
    items.map((_, i) => (i === 0 ? 1 : SCALE_MIN))
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  const getCardWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    const firstCard = el.firstElementChild as HTMLElement | null;
    if (!firstCard) return 0;
    return firstCard.offsetWidth + 14;
  }, []);

  const computeScales = useCallback(() => {
    const el = scrollRef.current;
    if (!el || items.length === 0) return;
    const viewCenter = el.scrollLeft + el.clientWidth / 2;
    const newScales: number[] = [];
    const children = el.children;
    for (let i = 0; i < children.length; i++) {
      const card = children[i] as HTMLElement;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(viewCenter - cardCenter);
      const ratio = Math.min(dist / (card.offsetWidth * 0.75), 1);
      newScales.push(1 - ratio * (1 - SCALE_MIN));
    }
    setCardScales(newScales);
  }, [items.length]);

  // Set scales correctly on first mount
  useEffect(() => {
    computeScales();
  }, [computeScales]);

  const onScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el && items.length > 0) {
        const step = getCardWidth();
        if (step > 0) {
          const idx = Math.round(el.scrollLeft / step);
          setActiveIndex(Math.max(0, Math.min(idx, items.length - 1)));
        }
        computeScales();
      }
      ticking.current = false;
    });
  }, [items.length, getCardWidth, computeScales]);

  const scrollToIndex = (i: number) => {
    const el = scrollRef.current;
    if (!el || items.length === 0) return;
    const clamped = Math.max(0, Math.min(i, items.length - 1));
    const step = getCardWidth();
    el.scrollTo({ left: step * clamped, behavior: "smooth" });
  };

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < items.length - 1;
  const currEntryDate = items[activeIndex] ? formatDate(items[activeIndex].entry_date) : "";

  function thumbHeight(i: number) {
    const dist = Math.abs(i - activeIndex);
    if (dist === 0) return 70;
    if (dist === 1) return 58;
    return 42;
  }
  function thumbWidth(i: number) {
    return Math.abs(i - activeIndex) <= 1 ? 49 : 36;
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px var(--px)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: 15,
            color: "#8a7d6e",
            textAlign: "center",
          }}
        >
          No entries yet. Tap + to create a text entry or upload a spread.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Nav row: date only */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px var(--px) 16px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif), 'Averia Serif Libre', Georgia, serif",
            fontSize: "clamp(16px, 3.5vw, 26px)",
            fontWeight: 400,
            color: "#634313",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {currEntryDate}
        </span>
      </div>

      {/* Carousel — fills remaining height, arrows centered vertically */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowX: "hidden",
          overflowY: "visible",
          display: "flex",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={!hasPrev}
          aria-label="Previous entry"
          className="btn-hover"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 5,
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #e6e4dc",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            opacity: hasPrev ? 1 : 0.25,
            pointerEvents: hasPrev ? "auto" : "none",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#634313" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="spread-scroll spread-scroll-fill"
          onScroll={onScroll}
          style={{ flex: 1, minWidth: 0 }}
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="spread-card spread-card-fill"
              style={{
                transform: `scale(${cardScales[idx] ?? SCALE_MIN})`,
                transformOrigin: "center center",
                transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                willChange: "transform",
              }}
            >
              {item.type === "entry" ? (
                <TextSpreadCard item={item} />
              ) : (
                <ScrapbookSpreadCard item={item} />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={!hasNext}
          aria-label="Next entry"
          className="btn-hover"
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 5,
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #e6e4dc",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            opacity: hasNext ? 1 : 0.25,
            pointerEvents: hasNext ? "auto" : "none",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#634313" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Thumbnail strip — in flow, always visible above nothing */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 8,
          padding: "16px var(--px) max(24px, env(safe-area-inset-bottom))",
          background: "var(--bg)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className="thumb-hover"
            style={{
              width: thumbWidth(i),
              height: thumbHeight(i),
              borderRadius: 6,
              background: "#d9d9d9",
              flexShrink: 0,
              border: "none",
              padding: 0,
              overflow: "hidden",
            }}
          >
            {item.type === "scrapbook" && (
              <img
                src={item.processed_url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Text entry spread card (37:339) ────────────────────── */
function TextSpreadCard({ item }: { item: Extract<JournalItem, { type: "entry" }> }) {
  return (
    <div
      className="spread-card-hover"
      style={{
        background: "#ffffff",
        border: "1.5px solid #e6e4dc",
        borderRadius: 18,
        padding: "22px 22px 28px",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Link
        href={`/entries/${item.id}`}
        style={{
          position: "absolute",
          top: 22,
          right: 22,
          padding: 0,
          background: "transparent",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "inherit",
        }}
        aria-label="Open entry"
      >
        <ExpandIcon />
      </Link>

      <CardHeader
        title={item.title}
        date={formatDate(item.entry_date)}
        mood={item.mood}
      />

      <div
        className="entry-body"
        dangerouslySetInnerHTML={{ __html: item.body || "" }}
        style={{
          fontFamily: "var(--font-sans), Inter, sans-serif",
          fontWeight: 400,
          fontSize: 13.4,
          lineHeight: "16.7px",
          color: "#3d3d3a",
          letterSpacing: "-0.267px",
          marginTop: 24,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      />
    </div>
  );
}

/* ─── Scrapbook spread card (37:340) ─────────────────────── */
function ScrapbookSpreadCard({ item }: { item: Extract<JournalItem, { type: "scrapbook" }> }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        flex: 1,
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Journal image — fills remaining space above text card */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <img
          src={item.processed_url}
          alt="Journal spread"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* Compact card: same header format and border as text entry cards */}
      <div
        className="spread-card-hover"
        style={{
          background: "#ffffff",
          border: "1.5px solid #e6e4dc",
          borderRadius: 18,
          padding: "18px 22px 18px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Link
          href={`/scrapbook/${item.id}`}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            padding: 0,
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
          aria-label="Expand"
        >
          <ExpandIcon />
        </Link>

        <CardHeader
          title={item.title}
          date={formatDate(item.entry_date)}
          mood={item.mood}
        />

        {item.transcription && (
          <div
            className="entry-body"
            dangerouslySetInnerHTML={{ __html: item.transcription || "" }}
            style={{
              fontFamily: "var(--font-sans), Inter, sans-serif",
              fontWeight: 400,
              fontSize: 12,
              lineHeight: "18px",
              color: "#3d3d3a",
              letterSpacing: "-0.26px",
              marginTop: 12,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          />
        )}
      </div>
    </div>
  );
}
