"use client";
import { useAudio } from '@/components/provider/audio-provider';
import { getAvgHsl } from '@/lib/utils';
import React, { useEffect, useState } from 'react'

export const Background = () => {
  const { currentSong } = useAudio();
  const [hsl, setHSL] = useState<string>("hsl(var(--primary) / 0.05)");
  
  useEffect(() => {
    const setColor = async () => {
      if (!currentSong?.img_url) return;
      const hsl = await getAvgHsl(currentSong?.img_url);
      if (hsl) setHSL(`hsl(${hsl} / 0.05)`);
    };
    
    setColor();
  }, [currentSong]);

  return (
    <div 
      className={`w-screen h-screen fixed top-0 left-0 transition-all duration-1000`}
      style={{ backgroundImage: `linear-gradient(45deg, ${hsl} 0%, hsl(var(--background)) 50%, hsl(var(--background)) 100%)` }}
    />
  )
}
