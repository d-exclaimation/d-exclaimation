"use client";

import Link from "@/(components)/link";
import { rc } from "@d-exclaimation/next";
import ResponsiveParallaxLayer from "../(components)/responsive-parallax-layer";

type OptionsProps = {
  action: string;
  title: string;
  href: string;
  icon: string;
  external?: boolean;
};

const Option = rc<OptionsProps>(({ href, action, title, icon, external }) => {
  return (
    <Link
      className="relative flex cursor-pointer rounded-lg px-5 py-4
      focus:outline-none group bg-neutral-50 w-[20rem] md:w-[28rem]
      hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:bg-neutral-900"
      href={href}
      external={external}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <div className="text-base">
            <p className="font-medium dark:text-white">{action}</p>
            <span className="inline text-black/50 dark:text-white/50">
              <span>{title}</span>
            </span>
          </div>
        </div>
        <div className="shrink-0 fill-white p-1.5 rounded-full bg-black dark:bg-white">
          <img className="h-8 w-8 invert dark:invert-0" src={icon} alt="icon" />
        </div>
      </div>
    </Link>
  );
});

type Props = {
  offset: number;
  options: OptionsProps[];
};

const CallToAction = rc<Props>(({ offset, options }) => {
  return (
    <ResponsiveParallaxLayer
      className="z-10 w-full !h-[100dvh] py-12 flex flex-col items-center justify-center gap-4"
      offset={offset}
      speed={0.2}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <span className="text-black dark:text-white text md:text-xl font-medium mb-4">
          So, that's all. What's next?
        </span>
        <div className="flex flex-col items-center justify-center gap-3 md:gap-5">
          {options.map((option, i) => (
            <Option key={option.href} {...option} />
          ))}
        </div>
      </div>
    </ResponsiveParallaxLayer>
  );
});

export default CallToAction;
