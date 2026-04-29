// Small inline SVG icons.

export function PaperIcon({ size = 18 }: { size?: number }) {
  // Stylised PDF document: red folded-corner badge with "PDF" label.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="inline-block"
    >
      <path
        d="M7 3h13l7 7v17a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"
        fill="#dc2626"
      />
      <path d="M20 3v7h7" fill="#fca5a5" opacity="0.9" />
      <text
        x="16"
        y="22"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="8"
        fontWeight="800"
        textAnchor="middle"
        fill="white"
      >
        PDF
      </text>
    </svg>
  );
}

export function PaperLink({ url, title = "Open paper (new tab)" }: { url: string; title?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={title}
      className="inline-flex shrink-0 items-center gap-1 rounded p-1 hover:bg-stone-100"
    >
      <PaperIcon size={20} />
    </a>
  );
}
