export default function NewEntryLoading() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px var(--px) 80px",
        minHeight: "100dvh",
        background: "var(--bg)",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <span
          style={{
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: 14,
            color: "var(--text-muted)",
          }}
        >
          ← Back to journal
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          marginTop: 8,
        }}
      >
        <div
          style={{
            height: 12,
            width: "40%",
            borderRadius: 4,
            background: "var(--border)",
            opacity: 0.7,
          }}
        />
        <div
          style={{
            height: 200,
            borderRadius: 8,
            background: "var(--border)",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            height: 12,
            width: "60%",
            borderRadius: 4,
            background: "var(--border)",
            opacity: 0.6,
          }}
        />
        <div
          style={{
            height: 12,
            width: "30%",
            borderRadius: 4,
            background: "var(--border)",
            opacity: 0.5,
          }}
        />
      </div>

      <div
        style={{
          marginTop: 32,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--text-muted)",
            animation: "loading-pulse 0.8s ease-in-out infinite",
          }}
        />
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--text-muted)",
            animation: "loading-pulse 0.8s ease-in-out 0.15s infinite",
          }}
        />
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--text-muted)",
            animation: "loading-pulse 0.8s ease-in-out 0.3s infinite",
          }}
        />
      </div>
    </main>
  );
}
