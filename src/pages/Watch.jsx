// File: src/pages/Watch.jsx
import { useSearchParams } from "react-router-dom";

export default function Watch() {
  const [params] = useSearchParams();
  const id = params.get("v");

  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <h1>Watch Page</h1>
      <p>Video ID: {id}</p>
    </div>
  );
}
