"use client";
import { useAudio } from "@/components/provider/audio-provider";
import React, { useState, useEffect, useRef, useCallback } from "react";

const width = 910;
const height = 512;

const Page = () => {
  const { analyser } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bufferLength, setBufferLength] = useState(1024);
  const [freqData, setFreqData] = useState<Uint8Array | null>(null);
  const [cctx, setCctx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    console.log(analyser);
    if (analyser == null) return;
    const bufferLength = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(freqData);

    setBufferLength(bufferLength);
    setFreqData(freqData);
  }, [analyser]);

  const draw = useCallback(() => {
    requestAnimationFrame(draw);
    if (!analyser || !freqData || !cctx) return;
    analyser.getByteTimeDomainData(freqData);

    cctx.clearRect(0, 0, width, height);

    cctx.lineWidth = 2;
    cctx.strokeStyle = `hsl(${freqData[0] * 2} 50 50)`;

    const sliceWith = width / bufferLength;
    let x = 0;
    const y = height / 2;

    cctx.beginPath();

    for (let i = 0; i < bufferLength; i++) {
      const h = (freqData[i] / 128);
      const y = (h * height) / 2;

      if (i == 0) {
        cctx.moveTo(0, y);
      } else {
        cctx.lineTo(x, y)
      }

      x += sliceWith;
    }

    cctx.lineTo(width, y);
    cctx.stroke();
  }, [analyser, bufferLength, freqData, cctx]);

  useEffect(() => {
    setCctx(canvasRef.current?.getContext("2d") || null);
    draw();
  }, [draw]);

  // For a typical 44.1kHz audio, the array roughly breaks down like this:
  // freqData[0-10]      // Sub-bass (~20-60Hz)
  // freqData[11-35]     // Bass (~60-250Hz)
  // freqData[36-100]    // Low-mids (~250-500Hz)
  // freqData[101-300]   // Mids (~500-2kHz)
  // freqData[301-700]   // High-mids (~2kHz-6kHz)
  // freqData[701-1023]  // Highs/Treble (~6kHz-20kHz)

  return (
    <div className="pl-40 w-screen h-screen items-center justify-center flex flex-col gap-2">
      <div className="rounded-lg overflow-clip border">
        <canvas ref={canvasRef} width={width} height={height} className="bg-background"></canvas>
      </div>
    </div>
  );
};

export default Page;
