export default function LoadingView() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "var(--bg-page)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 15,
          color: "var(--text-tertiary)",
          margin: 0,
        }}
      >
        Researching markets...
      </p>
    </div>
  );
}
