// File: src/components/Footer.jsx

import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "var(--footer-height)",
        background: "var(--app-bg)",
        borderTop: "1px solid #222",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      {/* Swapped order */}
      <FooterButton
        label="Playlists"
        icon="📁"
        onClick={() => navigate("/playlists")}
      />
      <FooterButton label="Home" icon="🏠" onClick={() => navigate("/")} />
      <FooterButton label="Now Playing" icon="🎵" disabled />
    </footer>
  );
}

function FooterButton({ icon, label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "none",
        border: "none",
        color: "#fff",
        cursor: disabled ? "default" : "pointer",
        textAlign: "center",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 11, opacity: 0.7 }}>{label}</div>
    </button>
  );
}
