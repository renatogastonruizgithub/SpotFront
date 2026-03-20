import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"

import { Search } from "lucide-react"
import { useState } from "react"

export function Serch({ onSearch }) {
    const [radius, setRadius] = useState(1) // Valor por defecto 15km
    return (
        <div className="
      fixed top-0 left-0 right-0
      w-full
      bg-[#0b0f14]
      border-t border-white/5
      backdrop-blur  py-4 z-50
      ">
            <ButtonGroup>
                <ButtonGroup>
                    <Button variant="outline" size="icon" onClick={() => onSearch(radius)}>
                        <Search />
                    </Button>
                </ButtonGroup>
                <ButtonGroup>
                    <InputGroup>
                        <InputGroupInput 
                        
                            placeholder="Radio en Km..." 
                            type="number"
                            value={radius}
                            className="text-white"
                            onChange={(e) => setRadius(e.target.value)}
                        />

                    </InputGroup>
                </ButtonGroup>
            </ButtonGroup>
        </div>
    )
}
