import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[1rem] text-sm font-bold uppercase tracking-widest transition-all focus-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-brand-dark text-white hover:bg-brand-primary shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-border bg-transparent hover:bg-brand-soft hover:text-brand-dark",
        secondary: "bg-brand-soft text-brand-dark hover:bg-brand-soft/80",
        ghost: "hover:bg-brand-soft hover:text-brand-dark",
        link: "text-brand-primary underline-offset-4 hover:underline",
        premium: "bg-brand-primary text-white hover:bg-brand-dark shadow-xl hover:shadow-brand-primary/10 shadow-brand-primary/10",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 px-4 text-[10px] rounded-lg",
        lg: "h-16 px-10 text-xs rounded-2xl",
        icon: "h-12 w-12",
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
        // @ts-ignore
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
