"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="h-5 w-5 shrink-0" />,
        info: <InfoIcon className="h-5 w-5 shrink-0" />,
        warning: <TriangleAlertIcon className="h-5 w-5 shrink-0" />,
        error: <OctagonXIcon className="h-5 w-5 shrink-0" />,
        loading: <Loader2Icon className="h-5 w-5 shrink-0 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast flex w-full items-start gap-3 overflow-hidden rounded-lg border-2 p-4 shadow-lg",
          title: "text-sm font-bold",
          description: "text-sm opacity-90",
          actionButton: "rounded-md px-3 py-1.5 text-sm font-medium",
          cancelButton: "rounded-md px-3 py-1.5 text-sm font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
