"use client";

import { rc } from "@d-exclaimation/next";
import { ParallaxLayer, type ParallaxLayerProps } from "@react-spring/parallax";

const ResponsiveParallaxLayer = rc<ParallaxLayerProps>(
  ({ children, style, ...rest }) => {
    return (
      <ParallaxLayer
        {...rest}
        style={{
          height: "100dvh",
          ...style,
        }}
      >
        {children}
      </ParallaxLayer>
    );
  }
);

export default ResponsiveParallaxLayer;
