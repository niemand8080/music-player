"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Skeleton } from "../ui/skeleton";

interface ProgressBarProps {
  loading?: boolean;
  defaultProgress: number;
  currentProgress: number;
  vertical?: boolean;
  className?: string;
  updateProgress: (progress: number) => void;
  handleMouseDown?: () => void;
  handleMouseUp?: () => void;
  setDragging?: (dragging: boolean) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ vertical, className, loading, defaultProgress, currentProgress, updateProgress, handleMouseDown, handleMouseUp, setDragging }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const classes = vertical ? {
    "1.5": "w-1.5",
    "2": "w-2",
    "full": "h-full",
  } : {
    "1.5": "h-1.5",
    "2": "h-2",
    "full": "w-full",
  }

  const updateBarProgress = useCallback((clientXY: number) => {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    const rect = containerElement.getBoundingClientRect();
    const direction = vertical ? rect.top : rect.left;
    const orientation = vertical ? rect.height : rect.width;
    const pos = Math.max(0, Math.min(1, (clientXY - direction) / orientation));
    setProgress(pos * 100);
    
    updateProgress(pos * 100);
  }, [updateProgress, vertical]);

  const handleMouseDownIntern = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const xy = vertical ? e.clientY : e.clientX;
    updateBarProgress(xy);
    if (handleMouseDown) handleMouseDown();
  }, [updateBarProgress, handleMouseDown, vertical]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setIsMoving(true);
      const xy = vertical ? e.clientY : e.clientX;
      updateBarProgress(xy);
      document.body.classList.add('cursor-pointer');
    }
  }, [isDragging, updateBarProgress, vertical]);

  const handleMouseUpIntern = useCallback(() => {
    setIsDragging(false);
    setIsMoving(false);
    document.body.classList.remove('cursor-pointer');
    if (handleMouseUp) handleMouseUp();
  }, [handleMouseUp]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUpIntern);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUpIntern);
    };
  }, [handleMouseMove, handleMouseUpIntern]);

  useEffect(() => {
    setProgress(defaultProgress);
  }, [defaultProgress]);

  useEffect(() => {
    setProgress(currentProgress);
  }, [currentProgress]);

  useEffect(() => {
    if (setDragging) setDragging(isDragging);
  }, [isDragging, setDragging]);

  if (loading) 
    return (
      <>
        <Skeleton className={`${classes.full} ${classes["1.5"]}`} />
      </>
    )

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      tabIndex={0}
      onMouseDown={handleMouseDownIntern}
      className={`${className} ${isDragging ? classes["2"] : classes["1.5"]} overflow-hidden ${classes.full} rounded-full bg-secondary cursor-pointer transition-all`}
    >
      <div 
        className={`${isDragging ? classes["2"] : classes["1.5"]} ${isMoving ? "" : "transition-all"} bg-primary`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};