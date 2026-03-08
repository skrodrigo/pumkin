"use client"

import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  LoadingIcon,
  CancelCircleIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { Icon } from "@/components/ui/icon"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <Icon icon={CheckmarkCircle02Icon} className="size-4" />,
        info: <Icon icon={InformationCircleIcon} className="size-4" />,
        warning: <Icon icon={AlertCircleIcon} className="size-4" />,
        error: <Icon icon={CancelCircleIcon} className="size-4" />,
        loading: <Icon icon={LoadingIcon} className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
