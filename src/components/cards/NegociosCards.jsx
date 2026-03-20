import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel"


import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

export default function NegociosCards({ bars }) {
  return (
    <div className="absolute bottom-5 left-0 right-0 z-50 px-3 w-full z-50">

      <Carousel
        opts={{
          align: "start",
          dragFree: true
        }}
      >
        <CarouselContent>

          {bars.map((bar) => (
            <CarouselItem
              key={bar.id}
              className="basis-[85%]"
            >

              <Card
                className="
                bg-[#0b0f14]/95
                border-white/5
                backdrop-blur
                flex
                gap-3
                p-3
                h-25"
              >

                {/* Imagen */}
                <img
                  src={bar.image}
                  className="
                  w-20
                  h-20
                  rounded-lg
                  object-cover
                  "
                />

                {/* Info */}
                <div className="flex flex-col flex-1 justify-between">

                  <div>

                    <div className="flex justify-between items-center">

                      <h3 className="text-sm font-semibold">
                        {bar.name}
                      </h3>

                      <div className="flex items-center gap-1 text-yellow-400 text-xs">
                        <Star size={14} />
                        {bar.rating}
                      </div>

                    </div>

                    <p className="text-xs text-gray-400">
                      {bar.distance} • {bar.open}
                    </p>

                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 text-[10px]">

                    <span className="px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-400">
                      {bar.tag1}
                    </span>

                    <span className="px-2 py-1 rounded-md bg-pink-500/20 text-pink-400">
                      {bar.tag2}
                    </span>

                  </div>

                </div>

                {/* Botón */}
                <div className="flex items-center">

                  <Button
                    size="sm"
                    className="
                    bg-cyan-500
                    hover:bg-cyan-400
                    text-black
                    text-xs
                    px-3
                    "
                  >
                    Ver
                  </Button>

                </div>

              </Card>

            </CarouselItem>
          ))}

        </CarouselContent>
      </Carousel>

    </div>
  )
}