
import { useEffect, useState } from "react";
import { request } from "../services/employment";

export default function ResourceCompletion({ resourceId }) {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    request("/progress")
      .then((ids) => {
        setCompleted(ids.includes(resourceId));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [resourceId]);

  async function handleChange() {
    setLoading(true);
    setError("");

    try {
      const result = await request(
        `/progress/${resourceId}`,
        "PUT",
        { completed: !completed }
      );

      setCompleted(result.completed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={completed}
          disabled={loading}
          onChange={handleChange}
        />
        Resource completed
      </label>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
