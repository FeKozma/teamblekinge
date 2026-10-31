/** Document tile with a folded corner, as on the protocol rows in the drawups. */
export function PdfIcon({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden="true"
      className={`relative flex flex-none items-end justify-center rounded border border-[#cfc8c4] bg-white font-extrabold text-orange-dark ${
        size === "sm" ? "h-11 w-9 pb-1 text-[9px]" : "h-[54px] w-11 pb-1.5 text-[11px]"
      }`}
    >
      <span className="absolute -top-px -right-px h-2.5 w-2.5 rounded-bl-[3px] border-b border-l border-[#cfc8c4] bg-paper" />
      PDF
    </span>
  );
}
