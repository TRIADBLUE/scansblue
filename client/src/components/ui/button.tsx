// client/src/components/ui/button.tsx
import React from "react";

export const COLORS = {
  triadBlue: "#00203A",   // Primary — Submit / Send buttons
  redNav: "#A00028",      // Navigation, New Chat, Attach, Voice
  lightBlueText: "#FFFFFF", // Text for all buttons
  borderBlack: "#09080e",  // Border for all buttons
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "triadBlue" | "redNav" | "ghost";
  size?: "sm" | "md";
  asChild?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = "md",
  asChild = false,
  className,
  ...props
}) => {
  const baseClasses = "font-semibold rounded-md focus:outline-none transition-colors duration-200";
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-base";

  const variantClasses =
    variant === "triadBlue"
      ? `bg-[${COLORS.triadBlue}] text-[${COLORS.lightBlueText}] border-[${COLORS.borderBlack}]`
      : variant === "redNav"
      ? `bg-[${COLORS.redNav}] text-[${COLORS.lightBlueText}] border-[${COLORS.borderBlack}]`
      : "bg-transparent text-foreground border-none";

  const ButtonTag: any = asChild ? React.Fragment : "button";

  return <ButtonTag {...props} className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} />;
};