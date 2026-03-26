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
                bg-[#111418]/95
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

                      <div className="flex items-center gap-1 text-[#FFC107] text-xs">
                        <Star size={14} className="fill-[#FFC107] stroke-[#FFC107]" />
                        {bar.rating}
                      </div>

                    </div>

                    <p className="text-xs text-gray-400">
                      {bar.distance} • {bar.open}
                    </p>

                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 text-[10px]">

                    <span className="px-2 py-1 rounded-md border border-[#00D1FF]/40 bg-[#00D1FF]/15 text-[#7eefff]">
                      {bar.tag1}
                    </span>

                    <span className="px-2 py-1 rounded-md border border-[#00D1FF]/35 bg-[#00D1FF]/10 text-[#9fefe8]">
                      {bar.tag2}
                    </span>

                  </div>

                </div>

                {/* Botón */}
                <div className="flex items-center">

                  <Button
                    size="sm"
                    className="
                    bg-[#00D1FF]
                    hover:bg-[#33d9ff]
                    text-[#111418]
                    text-xs
                    px-3
                    font-semibold
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