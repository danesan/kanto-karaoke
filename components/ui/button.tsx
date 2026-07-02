import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md px-5 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-[var(--shadow-neon)] hover:-translate-y-0.5 hover:brightness-105",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[var(--shadow-soft)] hover:brightness-105",
        outline:
          "border bg-card text-foreground shadow-[var(--shadow-soft)] hover:border-primary/50 hover:bg-primary/5",
        ghost: "text-foreground hover:bg-primary/10 hover:text-secondary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_12px_24px_rgba(223,28,28,0.16)] hover:brightness-105"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        icon: "h-10 w-10 px-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
