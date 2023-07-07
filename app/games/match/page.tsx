//
//  page.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 29 May 2023
//

import { page } from "@d-exclaimation/next";
import Match from "./match";

const Page = page(() => {
  return (
    <div className="flex flex-col items-center justify-center min-w-screen min-h-screen">
      <Match />
    </div>
  );
});

export const runtime = "edge";

export default Page;
