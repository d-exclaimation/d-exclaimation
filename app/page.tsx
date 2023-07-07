//
//  page.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 07 Jul 2023
//

import { page } from "@d-exclaimation/next";
import PageClient from "./(parallax)/page.client";

const Page = page(() => {
  return (
    <div className="flex items-center justify-center min-w-full min-h-[100dvh]">
      <PageClient />
    </div>
  );
});

export const runtime = "edge";

export default Page;
