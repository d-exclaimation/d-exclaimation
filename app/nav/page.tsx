//
//  page.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 29 Apr 2023
//

import DesktopNavigation from "./desktop-nav";
import MobileNavigation from "./mobile-nav";
import Signature from "./signature";

async function Page() {
  return (
    <div className="animate-fade-in w-screen bg-transparent">
      <div className="lg:h-screen lg:overflow-auto">
        <div className="opacity-0 h-[30vh] lg:h-[15vh]" />
        <DesktopNavigation />
        <MobileNavigation />
        <Signature />
      </div>
    </div>
  );
}

export default Page;
