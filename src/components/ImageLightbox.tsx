import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";

let activeId: string | null = null;
const listeners = new Set<(id: string | null) => void>();

function setActive(id: string | null) {
  activeId = id;
  listeners.forEach((fn) => fn(activeId));
}

function useActiveLightbox() {
  const [active, setActive] = useState(activeId);
  useEffect(() => {
    listeners.add(setActive);
    return () => {
      listeners.delete(setActive);
    };
  }, []);
  return active;
}

export function ImageLightbox({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const active = useActiveLightbox();
  const open = active === id;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setActive(id)}
        className="block w-full cursor-zoom-in appearance-none border-none bg-transparent p-0 text-left"
        aria-label={`View ${alt}`}
      >
        {children}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="btn fx-9 btn-pill btn-lime absolute right-4 top-4"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] max-w-[90vw] rounded-3xl border-[3px] border-white object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
