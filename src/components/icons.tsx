// Small inline icons.

const PDF_ICON_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/330px-PDF_file_icon.svg.png?_=20220802235851";

export function PaperIcon({ size = 18 }: { size?: number }) {
  return (
    <img
      src={PDF_ICON_URL}
      alt="PDF"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    />
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
