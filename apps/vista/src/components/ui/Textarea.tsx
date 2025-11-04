import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={props.id}
        className="block font-[family-name:var(--font-cormorant)] text-sm font-medium uppercase tracking-wider text-[#370D10]/80"
      >
        {label}
      </label>
      <textarea
        className={`w-full resize-none rounded-sm border border-[#370D10]/20 bg-white px-4 py-3 font-[family-name:var(--font-cormorant)] text-base text-[#370D10] transition-colors focus:border-[#501515] focus:outline-none focus:ring-1 focus:ring-[#501515] ${className}`}
        {...props}
      />
    </div>
  );
}
