"use client";
import React, { useRef, useEffect } from "react";

interface CameraProps {
  onFrame: (base64Image: string) => void;
  isActive: boolean;
}

export function Camera({ onFrame, isActive }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let intervalId: ReturnType<typeof window.setInterval> | null = null;
    let cancelled = false;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          console.error("Camera API not supported in this browser");
          return;
        }

        // 📷 Get webcam stream
        console.log("🎥 Requesting camera access...");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch((error) => {
            console.error("Failed to play video element:", error);
          });
        }

        // ⏱️ Capture frame roughly every 150ms (optimized)
        intervalId = window.setInterval(() => {
          if (videoRef.current && canvasRef.current && isActive) {
            const context = canvasRef.current.getContext("2d");
            if (context && videoRef.current.videoWidth > 0) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              context.drawImage(videoRef.current, 0, 0);

              // Extract base64 jpeg
              const frame = canvasRef.current.toDataURL("image/jpeg", 0.6);
              console.log("📸 Captured frame:", frame.length);
              onFrame(frame);
            }
          }
        }, 150);
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    if (isActive) {
      startCamera();
    }

    return () => {
      cancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isActive, onFrame]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden premium-box border-none">
      {!isActive && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10 font-medium text-sm md:text-base text-slate-500">
          Camera Off 😴
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
