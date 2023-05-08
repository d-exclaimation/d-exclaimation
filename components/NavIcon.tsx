"use client";

//
//  NavIcon.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 May 2023
//

import Link from "next/link";
import { usePathname } from "next/navigation";
import { rc } from "~/next/rc";

const Navicon = rc(() => {
  const pathname = usePathname();

  return (
    <Link
      className="z-40 flex fixed top-4 right-4 p-2 rounded shadow bg-white/50 lg:shadow-none lg:bg-transparent hover:scale-95 active:scale-95"
      href="/"
    >
      <img
        className="w-8 h-8 data-[home='true']:opacity-0 data-[home='true']:rotate-180 transition-all duration-700"
        src="/icon/mix.svg"
        data-home={pathname === "/"}
      />
    </Link>
  );
});

export default Navicon;
