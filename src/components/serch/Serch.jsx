import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"

import { AudioLinesIcon, PlusIcon } from "lucide-react"

export function Serch() {
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
                    <Button variant="outline" size="icon">
                        <PlusIcon />
                    </Button>
                </ButtonGroup>
                <ButtonGroup>
                    <InputGroup>
                        <InputGroupInput placeholder="Send a message..." />

                    </InputGroup>
                </ButtonGroup>
            </ButtonGroup>
        </div>
    )
}
