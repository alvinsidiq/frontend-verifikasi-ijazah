export function normalizeRefHash(refRaw) {
  const s = (refRaw || "").toString().trim();
  if (!s) return null;

  let r = s;
  if (!r.startsWith("0x")) r = `0x${r}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(r)) return null;

  return r.toLowerCase();
}
