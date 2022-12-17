//
//  Activity.tsx
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import { match, Union } from "@d-exclaimation/union";
import type { ReactNode } from "react";
import type { Color } from "../common/Styling";
import type { XFC } from "../common/XFC";

type Props = {
  subtitle: string;
  title: {
    name: string;
    href?: string;
  };
  time: Union<{
    ongoing: { start: string };
    specified: { start: string; end: string };
  }>;
  children: ReactNode;
  color?: {
    decoration: Color.Decoration;
    border: Color.of<"border-l">;
    text: Color.Text;
  };
};

/**
 * Activity component that shows an activity, its period, links, and description for it
 * @param param0.time The time period for this activity
 * @param param0.title The title of the activity and link for it
 * @param param0.subtitle The subtitle for the activity
 * @param param0.color The styling for the actitivy
 */
const Activity: XFC<Props> = ({
  children,
  time,
  title: company,
  subtitle: role,
  color,
}) => {
  const { border, decoration, text } = color ?? {
    border: "border-l-blue-200",
    decoration: "decoration-blue-400",
    text: "text-blue-400",
  };
  return (
    <div
      className={`flex flex-col items-start justify-center my-3 ${border} border-l-2 pl-2`}
    >
      <span className="text-xs md:text-sm font-semibold">{role}</span>
      <a
        className={`${text} font-bold active:underline ${decoration} hover:underline cursor-pointer`}
        href={company.href ?? "/"}
      >
        @{company.name}
      </a>
      <span className="text-xs md:text-sm font-extralight">
        {match<Props["time"], string>(time, {
          ongoing: ({ start }) => `Ongoing from ${start}`,
          specified: ({ start, end }) => `${start} - ${end}`,
        })}
      </span>
      <span className="hidden md:block md:text-xs font-thin text-neutral-600">
        {children}
      </span>
    </div>
  );
};

export default Activity;
