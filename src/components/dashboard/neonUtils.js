// Small shared helpers for Neon Lounge dashboard.

/**
 * Convierte un color hex (#RRGGBB) a su equivalente RGB "r, g, b" para usar en CSS rgba().
 * Ej: "#00D1FF" -> "0, 209, 255"
 */
export function hexToRgbTuple(hex) {
  const cleaned = String(hex || "").replace("#", "").trim()
  if (cleaned.length !== 6) return "0, 209, 255"

  const r = parseInt(cleaned.slice(0, 2), 16)
  const g = parseInt(cleaned.slice(2, 4), 16)
  const b = parseInt(cleaned.slice(4, 6), 16)
  if ([r, g, b].some((n) => !Number.isFinite(n))) return "0, 209, 255"
  return `${r}, ${g}, ${b}`
}

