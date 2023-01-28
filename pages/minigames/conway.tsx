//
//  conway.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 14 Dec 2022
//

//
//  conway.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 14 Dec 2022
//

import type { FC } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import { withHead } from "../../hoc/withHead";
import { useConway } from "../../hooks/minigames/conway/useConway";

const Conway: FC = () => {
  const { grid, toggle, isRunning, onoff } = useConway();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <button
        className="
        fixed z-40 
        right-3 bottom-3 md:right-4 md:bottom-4
        p-1 md:p-2 
        bg-white rounded-md select-none 
        transform shadow-md shadow-neutral-500
        active:bg-gray-100
        active:scale-95 active:shadow-md
        md:hover:scale-95 md:hover:shadow-md
        transition duration-400
        "
        onClick={onoff}
      >
        {!isRunning ? (
          <FiPlay className="fill-emerald-600 text-emerald-600 w-5 md:w-6 h-5 z-50 md:h-6" />
        ) : (
          <FiPause className="fill-blue-600 text-blue-600 w-5 md:w-6 h-5 z-50 md:h-6" />
        )}
      </button>
      <div className="w-full h-full p-2 overflow-y-scroll overflow-x-scroll bg-neutral-100 grid gap-1 grid-cols-[repeat(100,0.75rem)]">
        {grid.map((row, y) =>
          row.map((isActive, x) => {
            const key = `${x},${y}`;
            return (
              <span
                key={key}
                className={`w-3 h-3 ${isActive ? "bg-sky-900" : "bg-slate-50"}`}
                onClick={() => toggle({ x, y })}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default withHead(Conway, {
  title: "Game of life",
  description: "A minigame using tiles and a bit of computer science",
});
