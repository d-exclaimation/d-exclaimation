//
//  page.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 29 Apr 2023
//

import { rc } from "~/next/rc";
import DesktopNavigation from "./desktop-nav";
import MobileNavigation from "./mobile-nav";

const Page = rc(() => {
  return (
    <div className="animate-fade-in w-screen bg-transparent">
      <div className="lg:h-screen lg:overflow-auto">
        <div className="opacity-0 h-[40vh] lg:h-[15vh]" />
        <DesktopNavigation />
        <MobileNavigation />
        <div className="opacity-0 h-[60vh] lg:h-[25vh]" />
      </div>
    </div>
  );
});

export const runtime = "edge";

export default Page;
