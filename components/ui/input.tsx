import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={
        "rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-[#1f1630] dark:text-slate-100 " +
        className
      }
      {...props}
    />
  )
);
Input.displayName = "Input";

export default Input;