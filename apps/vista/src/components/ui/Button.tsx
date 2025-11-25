import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: ReactNode;
  href?: string;
}

export function Button({ 
  variant = "primary", 
  children, 
  href,
  className = "",
  ...props 
}: ButtonProps) {
  const baseStyles = "rounded font-[family-name:var(--font-cormorant)] font-medium tracking-wide transition-all duration-300";
  
  const variants = {
    primary: "bg-[#370D10] text-[#E1D6C7] hover:bg-[#501515]",
    secondary: "border border-[#E1D6C7]/30 bg-[#E1D6C7] text-[#370D10] hover:bg-[#370D10] hover:text-[#E1D6C7]"
  };

  const styles = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
