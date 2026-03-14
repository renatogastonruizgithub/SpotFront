import { Card } from "@/components/ui/card"

export default function NegociosCards() {
  return (
    <div className="absolute bottom-20 left-4 right-4 z-50">
      <Card className="bg-black/80 p-4 flex gap-4">

        <img
          src="/bar.jpg"
          className="w-20 h-20 rounded-lg object-cover"
        />

        <div className="flex-1">
          <h3 className="text-lg font-bold">
            Cervecería Neón ⭐ 4.8
          </h3>

          <p className="text-sm text-gray-400">
            A 200m • Abierto hasta 03:00
          </p>

          <button className="mt-2 bg-cyan-500 px-4 py-2 rounded-lg">
            Ver Detalles
          </button>
        </div>

      </Card>
    </div>
  )
}