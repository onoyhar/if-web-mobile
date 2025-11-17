import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={
        "flex items-center justify-center rounded-xl font-medium transition-colors " +
        (size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm") +
        " " +
        className
      }
      {...props}
    />
  )
);
Button.displayName = "Button";

export default Button;