import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary px-5 py-2.5 text-primary-foreground shadow-glow hover:opacity-95",
        secondary:
          "bg-secondary px-5 py-2.5 text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-border bg-background px-5 py-2.5 text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "px-4 py-2.5 text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive px-5 py-2.5 text-destructive-foreground hover:opacity-95"
      },
      size: {
        default: "",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-3 text-base",
        icon: "size-10 rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
