//
//  page.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 18 May 2023
//

import { redirect } from "next/navigation";

/** The game lives on the arcade cabinet now; this keeps the old address working. */
function Page() {
  redirect("/#arcade");
}

export default Page;
