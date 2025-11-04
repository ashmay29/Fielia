import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  optional?: boolean;
}

export function Input({ label, optional, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={props.id}
        className="block font-[family-name:var(--font-cormorant)] text-sm font-medium uppercase tracking-wider text-[#370D10]/80"
      >
        {label}{" "}
        {optional && (
          <span className="text-xs normal-case text-[#370D10]/50">
            (optional)
          </span>
        )}
      </label>
      <input
        className={`w-full rounded-sm border border-[#370D10]/20 bg-white px-4 py-3 font-[family-name:var(--font-cormorant)] text-base text-[#370D10] transition-colors focus:border-[#501515] focus:outline-none focus:ring-1 focus:ring-[#501515] ${className}`}
        {...props}
      />
    </div>
  );
}
