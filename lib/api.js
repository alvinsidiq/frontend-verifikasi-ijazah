import { getAuth } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function buildHeaders() {
  const auth =
    typeof window !== "undefined" ? getAuth() : null;

  const headers = {
    "Content-Type": "application/json",
  };

  if (auth?.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  return headers;
}

export async function apiGet(path) {
  const headers = buildHeaders();
  const url = `${BASE_URL}${path}`;

  try {
    console.log("API GET:", url);

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
    console.error("API GET error:", url, err);
    throw err;
  }
}

export async function apiPost(path, body) {
  const headers = buildHeaders();
  const url = `${BASE_URL}${path}`;

  try {
    console.log("API POST:", url, body);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

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
    console.error("API POST error:", url, err);
    throw err;
  }
}

export async function apiPut(path, body) {
  const headers = buildHeaders();
  const url = `${BASE_URL}${path}`;

  try {
    console.log("API PUT:", url, body);

    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

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
    console.error("API PUT error:", url, err);
    throw err;
  }
}

export async function apiDelete(path) {
  const headers = buildHeaders();
  const url = `${BASE_URL}${path}`;

  try {
    console.log("API DELETE:", url);

    const res = await fetch(url, {
      method: "DELETE",
      headers,
    });

    const data = await res.json().catch(() => null);

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
    console.error("API DELETE error:", url, err);
    throw err;
  }
}
