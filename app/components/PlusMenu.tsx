"use client";

import Link from "next/link";

export default function PlusMenu() {
  return (
    <Link
      href="/entries/new"
      aria-label="New entry"
      className="btn-pill-hover"
      style={{
        width: 44,
        height: 44,
        minWidth: 44,
        minHeight: 44,
        borderRadius: "50%",
        background: "#ebe8dd",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        lineHeight: "0",
        paddingTop: 1,
        color: "#1a1a1a",
        flexShrink: 0,
        textDecoration: "none",
      }}
    >
      +
    </Link>
  );
}
