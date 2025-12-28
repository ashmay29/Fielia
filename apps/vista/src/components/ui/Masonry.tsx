import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { gsap } from "gsap";

const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number
): number => {
  const get = useCallback(() => {
    if (typeof window === "undefined") return defaultValue;
    return (
      values[queries.findIndex((q) => matchMedia(q).matches)] ?? defaultValue
    );
  }, [queries, values, defaultValue]);

  const [value, setValue] = useState<number>(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach((q) => matchMedia(q).addEventListener("change", handler));
    return () =>
      queries.forEach((q) =>
        matchMedia(q).removeEventListener("change", handler)
      );
  }, [queries, get]);

  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          // In case of error, resolving is also fine so we don't block
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

interface Item {
  id: string;
  img: string;
  url: string;
  height: number;
}

interface GridItem extends Item {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MasonryProps {
  items: Item[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "bottom" | "top" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
}

const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
}) => {
  const columns = useMedia(
    [
      "(min-width:1500px)",
      "(min-width:1000px)",
      "(min-width:600px)",
      "(min-width:400px)",
    ],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(false);

  // We need to trigger a re-calc when width changes, so we don't need to memoize invalid values
  // but wait for valid width. However, 0 width is possible initially.

  useEffect(() => {
    // Only preload if we have items
    if (items.length > 0) {
      preloadImages(items.map((i) => i.img)).then(() => setImagesReady(true));
    } else {
      setTimeout(() => setImagesReady(true), 0);
    }
  }, [items]);

  const grid = useMemo<GridItem[]>(() => {
    if (!width) return [];
    const colHeights = new Array(columns).fill(0);
    const gap = 16;
    // total width = (cols * colWidth) + ((cols-1) * gap)
    // width - ((cols-1)*gap) = cols * colWidth
    const totalGapWidth = (columns - 1) * gap;
    const columnWidth = (width - totalGapWidth) / columns;

    return items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      // x position: col * (width + gap)
      const x = col * (columnWidth + gap);
      const y = colHeights[col];

      // We are just displaying images, the passed 'height' is typically the intrinsic height
      // or a desired aspect ratio height.
      // If we want a strictly masonry feel where height respects aspect ratio, we need to know
      // the aspect ratio. The simplified example code passed 'height' as a constant number.
      // For a real masonry with resizing columns, the height should probably scale.
      // If 'child.height' is the pixel height at some base width, we should scale it.
      // However, sticking to the provided code logic:
      // const height = child.height / 2; // Arbitrary divisor from example?

      // Let's assume child.height is the intended display height for now, or use the logic from prompt:
      // Start prompt code: const height = child.height / 2;
      // We will stick to the user provided logic to ensure "correctness" relative to the snippet.
      const height = child.height / 2;

      colHeights[col] += height + gap;
      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady) return;
    // Kill existing animations if any?

    // We need to be careful with GSAP contexts in generic React components,
    // but the snippet uses simple selectors. Ideally we scope it.
    // Since we don't have scoped selectors easily without a ref to root, we'll try to rely on unique data-keys.

    const getInitialPosition = (item: GridItem) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return { x: item.x, y: item.y };

      let direction = animateFrom;
      if (animateFrom === "random") {
        const dirs = ["top", "bottom", "left", "right"];
        direction = dirs[
          Math.floor(Math.random() * dirs.length)
        ] as typeof animateFrom;
      }

      // Since items are absolute, coordinates are relative to the container.
      // We want to animate FROM outside or somewhere else.
      // x, y are the FINAL positions inside the container.
      // Note: The logic in the prompt had relatively hardcoded offsets (+- 200).
      // We can stick to that.

      switch (direction) {
        case "top":
          return { x: item.x, y: -200 };
        case "bottom":
          return { x: item.x, y: window.innerHeight + 200 }; // Ensure it's offscreen
        case "left":
          return { x: -200, y: item.y };
        case "right":
          return { x: window.innerWidth + 200, y: item.y };
        case "center":
          return {
            x: containerRect.width / 2 - item.w / 2,
            y: containerRect.height / 2 - item.h / 2,
          };
        default:
          return { x: item.x, y: item.y + 100 };
      }
    };

    const ctx = gsap.context(() => {
      grid.forEach((item, index) => {
        const selector = `[data-key="${item.id}"]`;
        // We can't rely on global selectors safely if multiple masonries exist, but for now it's fine.

        const animProps = {
          x: item.x,
          y: item.y,
          width: item.w,
          height: item.h,
        };

        if (!hasMounted.current) {
          const start = getInitialPosition(item);
          gsap.fromTo(
            selector,
            {
              opacity: 0,
              x: start.x,
              y: start.y,
              width: item.w,
              height: item.h,
              ...(blurToFocus && { filter: "blur(10px)" }),
              scale: 1, // reset scale
            },
            {
              opacity: 1,
              ...animProps,
              ...(blurToFocus && { filter: "blur(0px)" }),
              duration: 0.8,
              ease: "power3.out",
              delay: index * stagger,
            }
          );
        } else {
          // Animate to new positions when resizing
          gsap.to(selector, {
            ...animProps,
            duration,
            ease,
            overwrite: "auto",
          });
        }
      });
    }, containerRef); // Scope to container

    hasMounted.current = true;
    return () => ctx.revert();
  }, [
    grid,
    imagesReady,
    stagger,
    animateFrom,
    blurToFocus,
    duration,
    ease,
    containerRef,
  ]);

  const handleMouseEnter = (id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: hoverScale,
        duration: 0.3,
        ease: "power2.out",
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector(".color-overlay") as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector(".color-overlay") as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {grid.map((item) => (
        <div
          key={item.id}
          data-key={item.id}
          className="absolute box-content cursor-pointer"
          style={{ willChange: "transform, width, height, opacity" }}
          onClick={() => window.open(item.url, "_blank", "noopener")}
          onMouseEnter={(e) => handleMouseEnter(item.id, e.currentTarget)}
          onMouseLeave={(e) => handleMouseLeave(item.id, e.currentTarget)}
        >
          <div
            className="relative w-full h-full bg-cover bg-center rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)]"
            style={{ backgroundImage: `url(${item.img})` }}
          >
            {colorShiftOnHover && (
              <div className="color-overlay absolute inset-0 rounded-[10px] bg-linear-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;
