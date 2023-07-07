//
//  page.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 29 Apr 2023
//

import { page } from "@d-exclaimation/next";
import InteractiveHandle from "./interactive-handle";

const Page = page(() => {
  return <InteractiveHandle />;
});

export const runtime = "edge";

export default Page;
