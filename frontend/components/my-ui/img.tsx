import React, { useState } from "react";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

interface BlurImgProps {
  src: string;
  alt: string;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
}

export const BlurImg: React.FC<BlurImgProps> = ({
  src,
  alt,
  size,
  height = 100,
  width = 100,
  className,
}) => {
  const finalWidth = size || width;
  const finalHeight = size || height;
  const blur = Math.max(4, Math.min(24, 0.0267 * (size || width) + 2.667));

  return (
    <div
      className="relative"
      style={{
        width: `${finalWidth}px`,
        height: `${finalHeight}px`,
      }}
    >
      <Image
        src={src}
        alt={"Blur: " + alt}
        className="absolute shadow-inner"
        width={finalHeight / 3}
        height={finalHeight / 3}
        style={{
          filter: `blur(${blur}px)`,
          transform: `translate(100%, 100%) scale(${3})`,
        }}
      />
      <Image
        src={src}
        alt={alt}
        width={finalWidth}
        height={finalHeight}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
      />
    </div>
  );
};

interface SkeletonImgProps {
  url: string | undefined;
  width?: number;
  height?: number;
  rounded?: number;
}

export const SkeletonImg: React.FC<SkeletonImgProps> = ({
  url,
  width = 100,
  height = 100,
  rounded = 0,
}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${rounded}px`,
      }}
    >
      {url && (
        <Image
          src={url}
          alt="Song Cover"
          onLoad={() => setImageLoaded(true)}
          width={width}
          height={height}
          className={`${imageLoaded ? "opacity-100" : "opacity-0"} absolute`}
        />
      )}
      <Skeleton
        className={`${imageLoaded ? "hidden" : "opacity-100"} absolute`}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
};
