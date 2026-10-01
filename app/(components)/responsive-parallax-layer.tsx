"use client";

import { ParallaxLayer, type ParallaxLayerProps } from "@react-spring/parallax";

function ResponsiveParallaxLayer({ children, style, ...rest }: ParallaxLayerProps) {
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

export default ResponsiveParallaxLayer;
