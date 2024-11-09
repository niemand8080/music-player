import React from 'react'
import Image from 'next/image'

interface BlurImgProps {
  src: string;
  alt: string;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
}

export const BlurImg: React.FC<BlurImgProps> = ({ src, alt, size, height = 100, width = 100, className }) => {
  const finalWidth = size || width;
  const finalHeight = size || height;
  const blur = Math.max(4, Math.min(24, 0.0267 * (size || width) + 2.667));

  return (
    <div 
      className="relative"
      style={{ 
        width: `${finalWidth}px`, 
        height: `${finalHeight}px` 
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
          transform: `translate(100%, 100%) scale(${3})`
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
  )
}