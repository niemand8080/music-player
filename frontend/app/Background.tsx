"use client";
import { useAudio } from "@/components/provider/audio-provider";
// import { getAvgHsl } from "@/lib/utils";
import React, { useCallback, useEffect, useState } from "react";

export const Background = () => {
  const { currentSong } = useAudio();
  const [currentHsl, setCurrentHsl] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [targetHsl, setTargetHsl] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const parseHsl = useCallback((str: string): [number, number, number] => {
    if (str.includes("--")) {
      const varName = str.split("--")[1].split(")")[0];
      const hslStr = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(`--${varName}`).replaceAll("%", "");
      return hslStr.split(" ").map((str) => Number(str)) as [
        number,
        number,
        number
      ];
    } else {
      const hslStr = str.split("(")[1].split(" /")[0];
      return hslStr.split(" ").map((str) => Number(str)) as [
        number,
        number,
        number
      ];
    }
  }, []);

  useEffect(() => {
    setCurrentHsl(parseHsl("hsl(var(--background))"));
    setTargetHsl(parseHsl("hsl(var(--primary))"));
  }, [parseHsl]);

  useEffect(() => {
    // const setColor = async () => {
    //   if (!currentSong?.img_url) return;
    //   const colorStr = await getAvgHsl(currentSong?.img_url);
    //   const hsl = colorStr.split(" ").map((str) => Number(str));
    //   setTargetHsl([hsl[0], hsl[1], hsl[2]]);
    // };

    // setColor();
  }, [currentSong]);

  useEffect(() => {
    let animationFrameId: number;
    const TRANSITION_SPEED = 0.02;

    const animate = () => {
      setCurrentHsl((prevHsl) => {
        const newHsl: [number, number, number] = [...prevHsl];
        let needsUpdate = false;

        for (let i = 0; i < 3; i++) {
          const diff = targetHsl[i] - prevHsl[i];
          if (Math.abs(diff) < 1) {
            newHsl[i] = targetHsl[i];
          } else {
            needsUpdate = true;
            newHsl[i] += diff * TRANSITION_SPEED;
          }
        }

        return needsUpdate ? newHsl : targetHsl;
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetHsl]);

  return (
    <div
      className={`w-screen h-screen fixed top-0 left-0 pointer-events-none`}
      style={{
        backgroundImage: `linear-gradient(45deg, 
          hsl(${currentHsl[0]} ${currentHsl[1]} ${currentHsl[2]} / 0.1) 0%, 
          transparent 50%, 
          transparent 100%
        )`,
      }}
    />
  );
};
