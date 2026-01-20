import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full border-b-[1px] border-b-[var(--border,theme(colors.zinc.200))] bg-transparent text-[var(--text-main)] px-3 py-2 text-base focus-visible:ring-none focus-visible:outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--text-main)] placeholder:text-[color:var(--text-main)/60] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
