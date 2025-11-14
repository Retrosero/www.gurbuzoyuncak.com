import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-[#ffde59] text-gray-800 hover:bg-[#e6cc52]",
        // Özel durum renkleri
        category:
          "border-transparent bg-[#40E0D0] text-white hover:bg-[#30D0C0]",
        promotion:
          "border-transparent bg-[#FF69B4] text-white hover:bg-[#FF1493]",
        newproduct:
          "border-transparent bg-[#ffde59] text-black hover:bg-[#ffd700]",
        // Notification renkleri
        notification:
          "border-transparent bg-[#FF6B6B] text-white hover:bg-[#FF5252]",
        notification_success:
          "border-transparent bg-[#4ECDC4] text-white hover:bg-[#26A69A]",
        notification_warning:
          "border-transparent bg-[#FFE66D] text-black hover:bg-[#FFD93D]",
        notification_info:
          "border-transparent bg-[#74B9FF] text-white hover:bg-[#0984E3]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }