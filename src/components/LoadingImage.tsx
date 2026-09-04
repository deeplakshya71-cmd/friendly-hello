import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/reui-spinner";
import { cn } from "@/lib/utils";

/**
 * Image that keeps a spinner overlay visible until the bitmap is fully decoded.
 */
export function LoadingImage({
  src,
  alt,
  className,
  wrapperClassName,
  spinnerClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  spinnerClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className={cn("relative", wrapperClassName)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/5">
          <Spinner className={cn("size-7 text-[#0038FF]", spinnerClassName)} />
        </div>
      )}
    </div>
  );
}

export function LoadingBlock({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center",
        className,
      )}
    >
      <Spinner className="size-8 text-[#0038FF]" />
      <p className="btn-text text-black/50">{label}</p>
    </div>
  );
}
