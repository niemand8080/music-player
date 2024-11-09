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
  
  return (
    <div 
      className="relative"
      style={{ 
        width: `${finalWidth}px`, 
        height: `${finalHeight}px` 
      }}
    >
      <img
        src={src}
        className="absolute blur-sm shadow-inner"
        style={{ 
          height: `${finalHeight/3}px`,
          width: `${finalWidth/3}px`,
          transform: `translate(100%, 100%) scale(${Math.max(Math.min(3), 1)})`
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