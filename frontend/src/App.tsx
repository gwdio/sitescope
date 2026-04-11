import { useEffect, useState } from "react";

export default function App() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hello")
      .then((r) => r.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div>
      <h1>Sitescope</h1>
      <p>{message ?? "Loading..."}</p>
    </div>
  );
}
