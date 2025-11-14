import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const notificationVariants = cva(
  "relative flex w-full items-center justify-between rounded-lg border p-4 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-gray-300 bg-white text-gray-700",
        success:
          "border-[#4ECDC4] bg-[#4ECDC4] text-white",
        warning:
          "border-[#FFE66D] bg-[#FFE66D] text-white",
        error:
          "border-[#FF6B6B] bg-[#FF6B6B] text-white",
        info:
          "border-[#74B9FF] bg-[#74B9FF] text-white",
        promotion:
          "border-transparent bg-[#FF69B4] text-white",
        category:
          "border-transparent bg-[#40E0D0] text-white",
        newproduct:
          "border-transparent bg-[#ffde59] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  onClose?: () => void
  title?: string
  icon?: React.ReactNode
}

function Notification({ 
  className, 
  variant, 
  title, 
  icon, 
  onClose, 
  children, 
  ...props 
}: NotificationProps) {
  return (
    <div
      className={cn(notificationVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">
              {title}
            </h4>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export { Notification, notificationVariants }