// Neon Lounge Dashboard page.
// Ensambla Header, StatsCard (2x2), WeeklyChart, ActionCard (2) y BottomNav (5 ítems)
// con datos estáticos para un replicado visual (sin backend / sin lógica compleja).

import Header from "@/components/dashboard/Header"
import StatsCard from "@/components/dashboard/StatsCard"
import WeeklyChart from "@/components/dashboard/WeeklyChart"
import ActionCard from "@/components/dashboard/ActionCard"
import BottomNav from "@/components/dashboard/BottomNav"

import { Eye, Heart, MessageSquare, UserCheck, Megaphone, PenLine } from "lucide-react"

import "@/styles/neon-dashboard.css"

const STATS = [
  {
    title: "VISITAS",
    value: "1,284",
    delta: "+12.5% vs ayer",
    accentHex: "#00D1FF",
    icon: Eye,
  },
  {
    title: "FAVORITOS",
    value: "450",
    delta: "+5.2% este mes",
    accentHex: "#FF4FD8",
    icon: Heart,
  },
  {
    title: "RESEÑAS",
    value: "28",
    delta: "+2% pendientes",
    accentHex: "#F59E0B",
    icon: MessageSquare,
    // Nota: la imagen muestra "RESEÑAS" como card inferior izquierda.
    // El enunciado pedía solo 3 cards (VISITAS/FAVORITOS/ACTIVAS),
    // pero para replicar pixel-perfect incluimos RESEÑAS.
  },
  {
    title: "ACTIVAS",
    value: "5",
    delta: "0% estabilidad",
    accentHex: "#8B5CF6",
    icon: UserCheck,
  },
]

const ACTIONS = [
  {
    title: "Lanzar Promoción Flash",
    subtitle: "Atrae clientes en las próximas 2 horas",
    accentHex: "#00D1FF",
    icon: Megaphone,
  },
  {
    title: "Editar Menú Digital",
    subtitle: "Actualiza precios y stock en tiempo real",
    accentHex: "#8B5CF6",
    icon: PenLine,
  },
]

export default function NeonDashboardPage() {
  return (
    <div className="neon-screen">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="neon-content pb-28">
          <Header />

          <div className="mt-5 grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <StatsCard key={s.title} title={s.title} value={s.value} delta={s.delta} accentHex={s.accentHex} icon={s.icon} />
            ))}
          </div>

          <WeeklyChart accentHex="#00D1FF" />

          <section className="mt-6">
            <div className="text-[1.05rem] font-semibold tracking-[-0.01em]">Acciones Rápidas</div>
            <div className="mt-3 flex flex-col gap-3">
              {ACTIONS.map((a) => (
                <ActionCard
                  key={a.title}
                  title={a.title}
                  subtitle={a.subtitle}
                  accentHex={a.accentHex}
                  icon={a.icon}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <BottomNav active="dashboard" />
    </div>
  )
}

