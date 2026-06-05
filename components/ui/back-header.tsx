type BackHeaderProps = {
  title: string;
  onBack: () => void;
  /** white treatment for use over dark/photo backgrounds */
  light?: boolean;
};

/** Screen header with a circular back button + title. */
export function BackHeader({ title, onBack, light }: BackHeaderProps) {
  const c = light ? "#fff" : "var(--ink)";
  return (
    <div
      style={{
        flexShrink: 0,
        padding: "50px 16px 6px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <button
        className="rm-tap"
        aria-label="ย้อนกลับ"
        onClick={onBack}
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "none",
          background: light ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.8)",
          boxShadow: "0 4px 12px rgba(43,27,23,0.1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={c}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <h2
        className="font-display"
        style={{ margin: 0, fontSize: 22, fontWeight: 600, color: c }}
      >
        {title}
      </h2>
    </div>
  );
}
