//
//  Hyperlink.tsx
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import type { Link } from "../types/Link";
import type { XFC } from "../types/XFC";
import Scrambled from "./Scrambled";

const Hyperlink: XFC<Link> = ({ href, site, username, ...rest }) => (
  <a
    className="flex flex-row mx-2 md:mx-0 md:my-1 decoration-neutral-300 active:underline hover:underline cursor-pointer"
    href={href}
  >
    <Scrambled
      phrases={[site, username]}
      align="items-center"
      justify="justify-center"
      speed={1}
      delay={5_000}
      {...rest}
    />
  </a>
);

export default Hyperlink;
