import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "glass",
      className
    )}
    style={{
      background: 'var(--glass-bg)',
      borderRadius: 'var(--glass-radius)',
      boxShadow: 'var(--glass-shadow)',
      color: '#111',
      ...props.style
    }}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
