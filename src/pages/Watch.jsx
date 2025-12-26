// File: src/pages/Watch.jsx
import { useSearchParams } from "react-router-dom";

export default function Watch() {
  const [params] = useSearchParams();
  const id = params.get("v");

  return (
    <div style={{ color: "#fff", padding: 20 }}>
      <h1>Watching video: {id}</h1>
    </div>
  );
}
