//
//  NavIcon.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 May 2023
//

import Link from "next/link";
import { rc } from "~/next/rc";

const Navicon = rc(() => {
  return (
    <Link
      className="z-40 flex fixed top-4 right-4 p-2 rounded 
      hover:scale-95 active:scale-95 shadow backdrop-blur-sm
      lg:shadow-none lg:bg-transparent lg:backdrop-blur-0 bg-white/50"
      href="/"
    >
      <img
        className="w-8 h-8 transition-all duration-700"
        src="/icon/mix.svg"
      />
    </Link>
  );
});

export default Navicon;
