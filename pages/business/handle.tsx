//
//  handle.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 24 Dec 2022
//

import type { FC } from "react";
import InteractiveHandle from "../../components/interactive/InteractiveHandle";

const Handle: FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <InteractiveHandle />
    </div>
  );
};

export default Handle;
