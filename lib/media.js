const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function isAbsoluteUrl(url) {
  return /^https?:\/\//i.test(url) || url.startsWith("data:");
}

export function resolveImageUrl(path) {
  if (!path) return "";
  if (isAbsoluteUrl(path)) return path;

  const base = API_BASE ? (API_BASE.endsWith("/") ? API_BASE : `${API_BASE}/`) : "";

  try {
    return base ? new URL(path, base).toString() : path;
  } catch (err) {
    console.warn("Gagal membentuk URL gambar:", path, err);
    return path;
  }
}
