"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  className?: string;
  barClassName?: string;
  indeterminate?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value = 0, max = 100, className, barClassName, indeterminate = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn("w-full h-1 bg-gray-200 rounded-full overflow-hidden", className)}
        {...props}
      >
        <div
          className={cn(
            "h-full bg-primary transition-all duration-300 ease-in-out",
            indeterminate && "animate-indeterminate-progress",
            barClassName
          )}
          style={{ width: indeterminate ? "100%" : `${percentage}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={indeterminate ? undefined : value}
        />
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar }; 