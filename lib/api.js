import { getAuth } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiGet(path) {
  const auth =
    typeof window !== "undefined" ? getAuth() : null;

  const headers = {
    "Content-Type": "application/json",
  };

  if (auth?.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  const url = `${BASE_URL}${path}`;

  try {
    console.log("API GET:", url); // 👈 log URL yang dipanggil

    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      console.warn("Gagal parse JSON dari:", url);
    }

    if (!res.ok || data?.success === false) {
      const message =
        data?.message ||
        `Request gagal: ${res.status} ${res.statusText}`;
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }

    return data;
  } catch (err) {
    console.error("API GET error:", url, err); // 👈 log error detail di console
    throw err;
  }
}
