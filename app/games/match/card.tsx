"use client";

//
//  card.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 29 May 2023
//


type Props = {
  className?: string;
  value: string;
  flipped?: boolean;
  active?: boolean;
  onClick?: () => void;
};

function FlippableCard({ className, value, flipped, active, onClick }: Props) {
  return (
    <button
      className={`group ${className}`}
      data-active={!!active}
      data-flipped={!!flipped}
      onClick={onClick}
    >
      <div
        className="w-full h-full shadow transition-transform duration-500 transform-3d
        group-data-[flipped=true]:transform-[rotateY(180deg)] group-data-[active=true]:border-2 border-lime-400
        dark:border-sky-600 rounded"
      >
        <div className="card-back absolute grid w-full h-full place-items-center rounded-sm backface-hidden">
          <span className="font-mono text-lg font-bold text-white md:text-3xl">d!</span>
        </div>
        <div
          className="absolute w-full h-full rounded transform-[rotateY(180deg)] backface-hidden
        bg-white flex items-center justify-center text-3xl md:text-6xl dark:bg-black"
        >
          {value}
        </div>
      </div>
    </button>
  );
}

export default FlippableCard;
