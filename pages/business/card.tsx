//
//  card.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 23 Dec 2022
//

import type { FC } from "react";
import InteractiveCard from "../../components/interactive/InteractiveCard";

const Card: FC = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <InteractiveCard />
    </div>
  );
};

export default Card;
