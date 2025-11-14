import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tagVariants = cva(
  "inline-flex items-center rounded-md px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100",
        category:
          "border-transparent bg-[#40E0D0] text-white hover:bg-[#30D0C0]",
        promotion:
          "border-transparent bg-[#FF69B4] text-white hover:bg-[#FF1493]",
        newproduct:
          "border-transparent bg-[#ffde59] text-black hover:bg-[#ffd700]",
        success:
          "border-transparent bg-[#ffde59] text-gray-800 hover:bg-[#e6cc52]",
        warning:
          "border-transparent bg-[#FFE66D] text-black hover:bg-[#FFD93D]",
        error:
          "border-transparent bg-[#FF6B6B] text-white hover:bg-[#FF5252]",
        info:
          "border-transparent bg-[#74B9FF] text-white hover:bg-[#0984E3]",
        outline: "text-foreground border border-gray-300",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        default: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {}

function Tag({ className, variant, size, ...props }: TagProps) {
  return (
    <div className={cn(tagVariants({ variant, size }), className)} {...props} />
  )
}

export { Tag, tagVariants }