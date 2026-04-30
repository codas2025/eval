import type { ReactNode } from "react";

/** Pure CSS hover tooltip. Wraps any inline trigger and renders a styled
 *  bubble below it on hover (or on keyboard focus). No delay, no reliance
 *  on the native title attribute (which is unreliable across OS / browser
 *  combinations). */
export function Tooltip({
  text,
  children,
  width = 280,
}: {
  text: string;
  children: ReactNode;
  width?: number;
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        style={{ width }}
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 rounded-md bg-ink-900 p-2 text-[11px] leading-snug text-white shadow-lg group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  );
}
