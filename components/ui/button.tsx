import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Three roles, as in Apple's HIG:
 * filled  – the one primary action in a view
 * tinted  – secondary actions
 * plain   – low-emphasis actions and inline links
 * Use `buttonVariants()` to style a <Link> the same way.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold transition-[background-color,color,opacity] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        filled: "bg-ink text-canvas hover:opacity-85",
        tinted: "bg-tint/10 text-tint hover:bg-tint/15",
        gray: "bg-fill text-ink hover:bg-fill-2",
        plain: "text-tint hover:text-tint-strong hover:underline",
        destructive: "bg-down/10 text-down hover:bg-down/15",
      },
      size: {
        sm: "h-9 px-3 text-subhead",
        md: "h-11 px-5 text-headline",
        lg: "h-12 px-7 text-headline",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
)
Button.displayName = "Button"

export { Button, buttonVariants }
