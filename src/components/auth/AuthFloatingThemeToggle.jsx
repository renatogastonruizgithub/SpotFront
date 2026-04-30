import { Lightbulb, Moon } from "lucide-react"

/**
 * FAB inferior derecho: alterna modo claro/oscuro en pantallas de auth (estilo sobrio).
 */
export default function AuthFloatingThemeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={[
        "fixed z-50 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-colors",
        "bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))]",
        "focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:outline-none",
        isDark
          ? "border-neutral-600 bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {isDark ? (
        <Lightbulb className="h-5 w-5" strokeWidth={2} aria-hidden />
      ) : (
        <Moon className="h-5 w-5" strokeWidth={2} aria-hidden />
      )}
    </button>
  )
}
