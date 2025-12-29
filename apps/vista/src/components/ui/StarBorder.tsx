import React from "react";

type StarBorderProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    className?: string;
    children?: React.ReactNode;
    color?: string;
    speed?: React.CSSProperties["animationDuration"];
    thickness?: number;
  };

const StarBorder = <T extends React.ElementType = "button">({
  as,
  className = "",
  color = "white",
  speed = "6s",
  thickness = 1,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || "button";

  // Validate color to prevent CSS injection
  const isValidColor = (colorValue: string): boolean => {
    // Allow hex colors, rgb/rgba, hsl/hsla, and named colors
    const colorPattern = /^(#[0-9A-Fa-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-z]+)$/i;
    return colorPattern.test(colorValue);
  };

  const safeColor = isValidColor(color) ? color : "white";

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[20px] ${className}`}
      {...rest}
      style={{
        padding: `${thickness}px`,
        ...(rest as { style?: React.CSSProperties }).style,
      }}
    >
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${safeColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${safeColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div className="relative z-[1] bg-[#1a0505] text-white text-center text-[16px] py-[16px] px-[26px] rounded-[20px] w-full h-full flex items-center justify-center">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
