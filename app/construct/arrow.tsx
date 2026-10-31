//
//  arrow.tsx
//  d-exclaimation
//
//  A thin page arrow that stays quiet beside the title
//

import { tw } from "@/(common)/tailwind";

type Props = {
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
};

function Arrow({ direction, disabled, onClick }: Props) {
  return (
    <button
      type="button"
      aria-label={direction === "next" ? "Next" : "Previous"}
      disabled={disabled}
      onClick={onClick}
      className="group pointer-events-auto px-1 py-3 text-black/35 transition-colors duration-300 enabled:hover:text-[#141414] disabled:text-black/10 md:px-6"
    >
      <svg
        viewBox="0 0 48 16"
        aria-hidden
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={tw(
          "h-3 w-6 overflow-visible transition-[translate] duration-200 md:h-4 md:w-12",
          direction === "next"
            ? "group-enabled:group-hover:translate-x-1"
            : "-scale-x-100 group-enabled:group-hover:-translate-x-1"
        )}
      >
        <path d="M1 8H47M40 1l7 7-7 7" vectorEffect="non-scaling-stroke" />
      </svg>
    </button>
  );
}

export default Arrow;
