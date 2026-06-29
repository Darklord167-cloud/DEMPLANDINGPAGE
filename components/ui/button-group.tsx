import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import { ButtonProps } from "@/components/ui/button"

const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex -space-x-px rounded-md shadow-sm",
      className
    )}
    {...props}
  >
    {React.Children.map(props.children, (child, index) => {
      if (!React.isValidElement(child)) return child

      const reactChild = child as React.ReactElement<any>
      const isFirst = index === 0
      const isLast = index === React.Children.count(props.children) - 1

      return React.cloneElement(reactChild, {
        className: cn(
          reactChild.props.className,
          !isFirst && "rounded-l-none",
          !isLast && "rounded-r-none",
          "focus:z-10" // To ensure the focus ring covers adjacent borders
        ),
      })
    })}
  </div>
))
ButtonGroup.displayName = "ButtonGroup"

export { ButtonGroup }
