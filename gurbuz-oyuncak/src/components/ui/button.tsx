import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transform-gpu",
  {
    variants: {
      variant: {
        default: "bg-[#0cc0df] text-white hover:bg-[#009ab3] shadow-lg hover:shadow-xl active:shadow-md",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl active:shadow-md",
        secondary:
          "bg-[#00a8cb] text-white hover:bg-[#009ab3] shadow-lg hover:shadow-xl active:shadow-md",
        outline:
          "border-2 border-[#0cc0df] bg-transparent text-[#0cc0df] hover:bg-[#0cc0df] hover:text-white shadow-md hover:shadow-lg active:shadow-sm",
        ghost: "text-[#0cc0df] hover:bg-[#f0f4f8] hover:text-[#00a8cb] active:bg-[#e2e8f0]",
        link: "text-[#0cc0df] underline-offset-4 hover:underline hover:text-[#00a8cb] p-0 h-auto",
        accent: "bg-[#0cc0df] text-white hover:bg-[#009ab3] shadow-lg hover:shadow-xl active:shadow-md",
        success: "bg-[#ffde59] text-black hover:bg-[#e6c84f] shadow-lg hover:shadow-xl active:shadow-md",
        warning: "bg-[#ff66c4] text-white hover:bg-[#e55bb0] shadow-lg hover:shadow-xl active:shadow-md",
      },
      size: {
        default: "h-10 px-6 py-2.5 rounded-xl min-w-[120px]",
        sm: "h-9 px-4 py-2 rounded-lg text-xs min-w-[100px]",
        lg: "h-12 px-8 py-3 rounded-xl text-base min-w-[140px]",
        icon: "h-10 w-10 rounded-xl min-w-[40px]",
        "icon-sm": "h-9 w-9 rounded-lg min-w-[36px]",
        "icon-lg": "h-12 w-12 rounded-xl min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }