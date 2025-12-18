// File: src/components/Footer.jsx

import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={{ padding: "12px", borderTop: "1px solid #222", textAlign: "left" }}>
      <button onClick={() => navigate("/")}>← Back</button>
    </footer>
  );
}
