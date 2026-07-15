import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion()
    
    if (asChild) {
      return (
        <Slot
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-full font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:pointer-events-none disabled:opacity-50",
            "bg-accent-primary text-white hover:bg-accent-primary/90 h-12 px-8 py-2",
            className
          )}
          ref={ref}
          {...props}
        />
      )
    }

    return (
      <motion.button
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:pointer-events-none disabled:opacity-50",
          "bg-accent-primary text-white hover:bg-accent-primary/90 h-12 px-8 py-2",
          className
        )}
        ref={ref}
        {...(props as import("framer-motion").HTMLMotionProps<"button">)}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
