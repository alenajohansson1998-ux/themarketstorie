import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap glass glass-hover text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[rgba(255,255,255,0.92)] text-[#111] hover:bg-[rgba(255,255,255,0.97)]",
        destructive:
          "bg-[#ffeaea] text-[#b00020] hover:bg-[#fff2f2]",
        outline:
          "bg-[rgba(255,255,255,0.92)] text-[#111] hover:bg-[rgba(255,255,255,0.97)]",
        secondary:
          "bg-[rgba(255,255,255,0.92)] text-[#444] hover:bg-[rgba(255,255,255,0.97)]",
        ghost: "bg-transparent text-[#111] hover:bg-[rgba(255,255,255,0.85)]",
        link: "text-[#2563eb] underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-[22px]",
        sm: "h-9 rounded-[18px] px-3",
        lg: "h-11 rounded-[24px] px-8",
        icon: "h-10 w-10 rounded-[22px]",
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
