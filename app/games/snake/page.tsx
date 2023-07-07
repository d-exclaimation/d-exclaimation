//
//  page.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 18 May 2023
//

import { page } from "@d-exclaimation/next";
import Snake from "./snake";

const Page = page(() => {
  return (
    <div className="flex flex-col items-center justify-center min-w-screen min-h-screen">
      <Snake />
    </div>
  );
});

export const runtime = "edge";

export default Page;
