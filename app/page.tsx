//
//  page.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 07 Jul 2023
//

import Showcase from "@/construct/showcase";
import type { Viewport } from "next";

function Page() {
  return (
    <>
      <style>{`html, body { background: #f4f3ef; }`}</style>
      <Showcase />
    </>
  );
}

export const viewport: Viewport = {
  themeColor: "#f4f3ef",
};

export default Page;
