/**
 * File: Watch.jsx
 * Path: src/pages/Watch/Watch.jsx
 * Description: Placeholder watch page. Will load video details and player next.
 */

import { useParams } from "react-router-dom";

export default function Watch() {
  const { id } = useParams();

  return (
    <div style={{ padding: 20 }}>
      <h1>Watch Page</h1>
      <p>Video ID: {id}</p>
    </div>
  );
}
