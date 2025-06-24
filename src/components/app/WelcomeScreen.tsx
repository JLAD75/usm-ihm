import logo from "../../assets/LogoUSM.png";
function WelcomeScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(180deg,#181a20 0%,#312e81 100%)",
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: "0",
          zIndex: 0,
          pointerEvents: "none",
        }}
        viewBox="0 0 1920 1080"
        fill="none"
      >
        <defs>
          <pattern
            id="dots-welcome"
            x="0"
            y="0"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.5" fill="#2d334d" opacity="0.18" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#dots-welcome)" />
      </svg>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src={logo}
          alt="Logo USM"
          style={{
            width: 80,
            height: 80,
            marginBottom: "0rem",
            borderRadius: "1.5rem",
            boxShadow: "0 4px 32px #6366f1cc",
            objectFit: "cover",
            background: "#23243a",
          }}
        />
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            color: "#a5b4fc",
            letterSpacing: "0.04em",
            textAlign: "center",
            marginBottom: "0rem",
            fontFamily: "Manrope,sans-serif",
            textShadow: "0 2px 12px #181a20",
          }}
        >
          User Stories Manager
        </h1>
        <span
          style={{
            width: "2.5rem",
            height: "2.5rem",
            display: "inline-block",
            marginTop: "2.5rem",
          }}
        >
          <span
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              border: "3px solid #6366f1",
              borderTop: "3px solid #23243a",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </span>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width:600px) {
          .welcome-h1 { font-size:1.5rem; }
        }
      `}</style>
    </div>
  );
}

export default WelcomeScreen;
