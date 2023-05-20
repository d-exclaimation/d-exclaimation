"use client";

//
//  NavIcon.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 May 2023
//

import { rc } from "@d-exclaimation/next";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navicon = rc(() => {
  const pathname = usePathname();

  return (
    <Link
      className="z-40 flex fixed top-4 right-4 p-2 rounded shadow backdrop-blur-sm
      hover:scale-95 active:scale-95 data-[home='true']:backdrop-blur-0
      lg:shadow-none lg:bg-transparent lg:backdrop-blur-0 bg-white/50 
      data-[home='true']:bg-transparent data-[home='true']:shadow-none"
      href="/"
      data-home={pathname === "/"}
    >
      <img
        className="w-8 h-8 data-[home='true']:opacity-0 data-[home='true']:translate-x-1/2 transition-all duration-700"
        src="/icon/mix.svg"
        data-home={pathname === "/"}
      />
    </Link>
  );
});

export default Navicon;
