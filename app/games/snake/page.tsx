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
    <div>
      <Snake />
    </div>
  );
});

export default Page;
