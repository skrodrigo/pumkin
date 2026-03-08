"use client"

import { Loading03Icon } from "@hugeicons/core-free-icons"
import type { ComponentProps } from "react"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { Icon } from "./icon"

type SpinnerProps = Omit<ComponentProps<typeof HugeiconsIcon>, 'icon'>

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Icon
      icon={Loading03Icon}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
