import React, { use, useEffect, useState } from "react";
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
  width = 0,
  height = 0,
  rounded = 0,
  ...rest
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
          {...rest}
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

interface ImageWithFallbackProps {
  url: string | "fallback";
  alt: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  fallbackSrc?: { url: string, append: string[] | "yt", extension?: string, startAtIndex?: number };
  className?: string;
  fill?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  url,
  alt,
  width = 0,
  height = 0,
  onLoad,
  fallbackSrc,
  className,
  fill = false
}) => {
  const [src, setSrc] = useState<string>();
  const [loaded, serLoaded] = useState<boolean>(false);
  const [currentFallBack, setCurrentFallBack] = useState<number>(fallbackSrc?.startAtIndex || 0);
  const yt_fallback = ["maxresdefault", "hqdefault", "mqdefault", "default", "0", "1", "2", "3"];

  const handleLoadError = () => {
    if (!fallbackSrc) return;
    let newSrc;
    if (fallbackSrc.append == "yt") {
      newSrc = fallbackSrc.url + yt_fallback[currentFallBack] + ".jpg";
    } else if (fallbackSrc.extension) {
      newSrc = fallbackSrc.url + fallbackSrc.append[currentFallBack] + fallbackSrc.extension;
    } else {
      newSrc = fallbackSrc.url + fallbackSrc.append[currentFallBack];
    }
    setSrc(newSrc);
    setCurrentFallBack(prev => prev += 1);
  };

  const handleLoad = () => {
    onLoad && onLoad();
    serLoaded(true);
  }

  useEffect(() => {
    if (url == "fallback") {
      handleLoadError();
    } else {
      setSrc(url);
    }
  }, [url]);

  return (
    <>
      {src && (
        <Image
          src={src}
          alt={alt}
          onErrorCapture={handleLoadError}
          onLoad={handleLoad}
          fill={fill ? fill : undefined}
          sizes={fill ? `(max-width: ${width}px) 100vw` : undefined}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={`${className} object-cover`}
        />
      )}
      {!src && !loaded && (
        <Skeleton  
          style={{ width: !fill ? `${width}px` : "100%", height: !fill ? `${height}px` : "100%" }}
        />
      )}
    </>
  );
};
