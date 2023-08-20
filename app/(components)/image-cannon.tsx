import { rc } from "@d-exclaimation/next";
import Image, { ImageProps } from "next/image";
import { tw } from "../(common)/tailwind";

type Props = ImageProps;

export default rc<ImageProps>(({ className, ...rest }) => {
  return (
    <div className="relative w-max h-max flex items-center justify-center">
      <Image
        className={tw(
          "absolute animate-cannon-left [animation-delay:1.4s]",
          className
        )}
        {...rest}
      />
      <Image
        className={tw(
          "absolute animate-cannon-left [animation-delay:0.7s]",
          className
        )}
        {...rest}
      />
      <Image
        className={tw("absolute animate-cannon-left", className)}
        {...rest}
      />
      <Image
        className={tw(
          "absolute animate-cannon-right [animation-delay:1.4s]",
          className
        )}
        {...rest}
      />
      <Image
        className={tw(
          "absolute animate-cannon-right [animation-delay:0.7s]",
          className
        )}
        {...rest}
      />
      <Image
        className={tw("absolute animate-cannon-right", className)}
        {...rest}
      />
      <Image className={tw("relative z-30", className)} {...rest} />
    </div>
  );
});
