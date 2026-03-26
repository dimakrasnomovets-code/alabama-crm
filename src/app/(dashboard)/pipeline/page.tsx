const columns = [
  { id: "New", label: "New", color: "#4A90D9" },
  { id: "Calling", label: "Calling", color: "#F2994A" },
  { id: "Spoke", label: "Spoke", color: "#27AE60" },
  { id: "Offer", label: "Offer", color: "#7C3AED" },
  { id: "UW", label: "Underwriting", color: "#D97706" },
  { id: "Won", label: "Won", color: "#27AE60" },
];

export default function PipelinePage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "4px",
          }}
        >
          Pipeline
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Drag and drop leads through your deal stages
        </p>
      </div>

      {/* Kanban board */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          paddingBottom: "16px",
        }}
      >
        {columns.map((col) => (
          <div
            key={col.id}
            style={{
              minWidth: "260px",
              flex: "1 0 260px",
              background: "var(--bg-tertiary)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-secondary)",
              overflow: "hidden",
            }}
          >
            {/* Column header */}
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--border-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: col.color,
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {col.label}
                </span>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-tertiary)",
                  background: "var(--bg-secondary)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                }}
              >
                0
              </span>
            </div>

            {/* Column body */}
            <div
              style={{
                padding: "8px",
                minHeight: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                  textAlign: "center",
                }}
              >
                Drop leads here
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
