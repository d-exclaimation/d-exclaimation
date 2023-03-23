//
//  Hyperlink.tsx
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import type { OutLink } from "../common/Link";
import type { XFC } from "../common/XFC";
import Scrambled from "./Scrambled";

/**
 * Create a interactive link to another link with username included
 * @param param0.href Link URL for this hyperlink
 * @param param0.site Name of the site linked
 * @param param0.username Username used for that site
 * @param param0.rest Scrambled component props
 */
const Hyperlink: XFC<OutLink> = ({ href, site, username, ...rest }) => (
  <a
    key={href + site + username}
    className="flex flex-row mx-2 md:mx-0 md:my-1 decoration-neutral-300 active:underline hover:underline cursor-pointer"
    href={href}
  >
    <Scrambled
      phrases={[username, site, site, site]}
      align="items-center"
      justify="justify-center"
      speed={40}
      delay={10_000}
      {...rest}
    />
  </a>
);

export default Hyperlink;
