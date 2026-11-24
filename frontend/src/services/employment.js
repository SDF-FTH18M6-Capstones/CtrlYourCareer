
import { api } from "../api";

export async function request(path, method = "GET", data) {
  const session = api.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api"}${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${
          session?.token || session?.access_token
        }`,
        "Content-Type": "application/json"
      },
      ...(data === undefined
        ? {}
        : { body: JSON.stringify(data) })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || result.message || result.msg || "Request failed"
    );
  }

  return result;
}
