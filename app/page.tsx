//
//  page.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 07 Jul 2023
//

import { page } from "@/(common)/next";
import PageClient from "./page.client";

const Page = page(() => {
  return (
    <div className="flex items-center justify-center min-w-full min-h-dvh">
      <PageClient />
    </div>
  );
});

export default Page;
