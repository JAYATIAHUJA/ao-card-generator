export function normalizeXUsername(value: string) {
  const handle = value.trim().replace(/^@+/, "");
  return `@${handle}`;
}

export function getPassIdentity(name: string | undefined, username: string) {
  const cleanName = name?.trim();
  return cleanName || normalizeXUsername(username).slice(1);
}

export function getTicketId(username: string) {
  const handle = normalizeXUsername(username).slice(1).toLowerCase();
  let hash = 0;
  for (let index = 0; index < handle.length; index++) {
    hash = (hash * 31 + handle.charCodeAt(index)) >>> 0;
  }
  return `AO-2026-${String((hash % 999) + 1).padStart(3, "0")}`;
}
