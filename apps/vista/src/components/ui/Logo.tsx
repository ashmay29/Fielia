import Image from "next/image";

interface LogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

const sizes = {
  small: "w-32 sm:w-40",
  medium: "w-[280px] sm:w-[350px] md:w-[400px]",
  large: "w-[320px] sm:w-[400px] md:w-[480px]"
};

export function Logo({ size = "medium", className = "" }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src="/fielia-logo.png"
        alt="FIELIA"
        width={400}
        height={120}
        className={sizes[size]}
        priority
      />
    </div>
  );
}
