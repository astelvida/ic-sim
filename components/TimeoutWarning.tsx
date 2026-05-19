"use client";

import { AnimatePresence, motion } from "framer-motion";

export function TimeoutWarning({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
          className="border hairline-strong bg-[rgba(122,35,40,0.06)] px-5 py-3 mb-4 flex items-center justify-between gap-4"
          role="alert"
          aria-live="polite"
        >
          <div className="text-[12.5px] text-bone-dim">
            <span className="mono text-[10px] tracking-[0.2em] uppercase text-oxblood mr-3">
              2 min left
            </span>
            Wrap your answer — the session caps at 18 minutes.
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="mono text-[12px] text-neutral hover:text-bone leading-none p-1"
            aria-label="Dismiss warning"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
