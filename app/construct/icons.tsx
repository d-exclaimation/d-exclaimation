//
//  icons.tsx
//  d-exclaimation
//
//  Small line icons for the project lists, drawn with the same pen as the page arrows
//

const paths = {
  dish: "M4 12a8 8 0 0 0 8.5 4.5L5.5 8A8 8 0 0 0 4 12ZM9 12l5-5M13 4l3 3",
  spotlight: "M3 7l6-4 2.5 3.5-6 4ZM11 5l6 4M9 9l5 8M7 11v6M4 17h6",
  photo: "M4 2h12v16H4ZM6 4h8v9H6Z",
  wing: "M3 17C4 10 9 4 17 3c0 3-1 5-3 6 1 1 0 3-2 3 0 2-2 3-4 3-1 0-3 1-5 2Z",
  rain: "M6 12a3.5 3.5 0 1 1 1-6.8A4.5 4.5 0 0 1 15.5 7a2.5 2.5 0 0 1-.5 5ZM7 15l-1 3M11 15l-1 3M15 15l-1 3",
  snake: "M3 16h9a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h9M17 4l-2 2M17 4l-2-2",
  cards: "M3 7h9v11H3ZM7 7V2h9v11h-4",
  door: "M12 3H4v14h8M8 10h9M14 7l3 3-3 3",
} as const;

export type IconName = keyof typeof paths;

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export default Icon;
