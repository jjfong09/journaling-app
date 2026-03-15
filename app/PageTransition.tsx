"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const easeOutQuad = [0.25, 0.46, 0.45, 0.94] as const;

const routeVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: easeOutQuad },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.2, ease: easeOutQuad },
  },
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<{
    prev: { pathname: string; content: React.ReactNode } | null;
    current: { pathname: string; content: React.ReactNode };
  }>(() => ({ prev: null, current: { pathname, content: children } }));
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathRef.current) {
      setState((s) => ({ ...s, current: { pathname, content: children } }));
      return;
    }
    prevPathRef.current = pathname;
    setState((s) => ({
      prev: s.current,
      current: { pathname, content: children },
    }));
  }, [pathname, children]);

  const clearPrev = () => setState((s) => (s.prev ? { ...s, prev: null } : s));

  // When prev is set, show only the exiting (old) page; after exit we clear prev and show current with enter
  if (state.prev) {
    return (
      <AnimatePresence mode="wait" onExitComplete={clearPrev}>
        <motion.div
          key={state.prev.pathname}
          variants={routeVariants}
          initial="animate"
          animate="animate"
          exit="exit"
          style={{ minHeight: "100%", isolation: "isolate" }}
        >
          {state.prev.content}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.current.pathname}
        variants={routeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: "100%", isolation: "isolate" }}
      >
        {state.current.content}
      </motion.div>
    </AnimatePresence>
  );
}
