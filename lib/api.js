import { getAuth } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getToken() {
  const auth =
    typeof window !== "undefined" ? getAuth() : null;
  return auth?.token || null;
}

function buildHeaders() {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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

export async function apiPostForm(path, formData) {
  const token = getToken();
  const url = `${BASE_URL}${path}`;

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    console.log("API POST FORM:", url);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

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
    console.error("API POST FORM error:", url, err);
    throw err;
  }
}

export async function apiPutForm(path, formData) {
  const token = getToken();
  const url = `${BASE_URL}${path}`;

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    console.log("API PUT FORM:", url);

    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

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
    console.error("API PUT FORM error:", url, err);
    throw err;
  }
}
