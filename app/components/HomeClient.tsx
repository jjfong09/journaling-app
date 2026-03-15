"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { JournalItem } from "@/lib/types";
import ListView from "./ListView";
import SpreadView from "./SpreadView";
import PlusMenu from "./PlusMenu";

const tabVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export default function HomeClient({ items }: { items: JournalItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") === "spread" ? "spread" : "list") as "list" | "spread";

  const setActiveTab = useCallback((tab: "list" | "spread") => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "list") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }, [router, searchParams]);

  return (
    <div
      style={{
        height: activeTab === "spread" ? "100dvh" : undefined,
        minHeight: activeTab === "spread" ? undefined : "100dvh",
        overflow: activeTab === "spread" ? "hidden" : undefined,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar — full width, responsive padding */}
      <header
        style={{
          padding: "16px var(--px) 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--bg)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <TabButton
            label="List"
            active={activeTab === "list"}
            onClick={() => setActiveTab("list")}
          />
          <TabButton
            label="Spread"
            active={activeTab === "spread"}
            onClick={() => setActiveTab("spread")}
          />
        </div>
        <PlusMenu />
      </header>

      <AnimatePresence mode="wait">
        {activeTab === "list" ? (
          <motion.div
            key="list"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
          >
            <ListView items={items} />
          </motion.div>
        ) : (
          <motion.div
            key="spread"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              flex: 1,
              minHeight: 0,
              height: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SpreadView items={items} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="btn-hover"
      style={{
        padding: "12px 32px",
        borderRadius: 22,
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        fontSize: 14,
        lineHeight: "20px",
        background: active ? "#342f2f" : "transparent",
        color: active ? "#fafafa" : "#342f2f",
        border: active ? "1px solid transparent" : "1px solid #342f2f",
        height: 44,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
