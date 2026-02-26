import { Loading03Icon } from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'

import { cn } from "@/lib/utils"

function Spinner({ className }: { className?: string }) {
  return (
    <Icon
      icon={Loading03Icon}
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
    />
  )
}

export { Spinner }
