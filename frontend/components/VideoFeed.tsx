"use client";
import React, { useRef, useState, useEffect } from "react";

interface VideoFeedProps {
  imageSrc: string | null;
  roi: { x: number; y: number; w: number; h: number } | null;
  isActive: boolean;
  status: "idle" | "connecting" | "live" | "error";
  frameCount: number;
  aiFeedback: string;
  onToggle: () => void;
}

export function VideoFeed({
  imageSrc,
  roi,
  isActive,
  status,
  frameCount,
  aiFeedback,
  onToggle,
}: VideoFeedProps) {
  const hasFace = Boolean(roi);
  const showLoading =
    status === "connecting" || (status === "live" && !imageSrc);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Slow down AI feedback
  const [displayedFeedback, setDisplayedFeedback] = useState(aiFeedback);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isFullscreen && roi) {
        const fullscreenCompliments = [
          "Your smile lights up the room!",
          "Daaaaaaaaamn! Look at you!",
          "Looking sharp today!",
          "Main character energy right here.",
          "Perfection in every pixel.",
        ];
        // Show random compliment when fullscreen and face is detected
        setDisplayedFeedback(
          fullscreenCompliments[
            Math.floor(Math.random() * fullscreenCompliments.length)
          ],
        );
      } else {
        setDisplayedFeedback(aiFeedback);
      }
    }, 2000); // Only update every 2 seconds to make it slower
    return () => clearTimeout(timer);
  }, [aiFeedback, isFullscreen, roi]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-[50vh] w-full aspect-video overflow-hidden neobrutalism-box bg-[#1f1f1f] transition-all duration-300 ease-in-out ${
        hasFace && !isFullscreen ? "ring-4 ring-emerald-400" : ""
      } ${isFullscreen ? "!border-0 !rounded-none !shadow-none" : ""}`}
    >
      {/* Top Badges */}
      <div className="absolute left-2 top-2 sm:left-4 sm:top-4 z-20 flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="neobrutalism-box !border-2 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          {status === "live"
            ? "🟢 Live"
            : status === "connecting"
              ? "🟡 Connecting"
              : "🔴 Off"}
        </span>
        <span className="hidden sm:block neobrutalism-box !border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
          {frameCount > 0 ? `Frame ${frameCount}` : "Waiting"}
        </span>
      </div>

      {/* Top Right Controls */}
      <div className="absolute right-2 top-2 sm:right-4 sm:top-4 z-20 flex items-center gap-2">
        {isFullscreen && isActive && (
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              }
              onToggle();
            }}
            className="neobrutalism-btn !border-2 !py-1 sm:!py-1.5 px-2 sm:px-3 neobrutalism-btn-danger text-[10px] sm:text-xs hover:bg-black"
            title="Stop Camera & Exit Fullscreen"
          >
            ⏹ <span className="hidden sm:inline">Stop</span>
          </button>
        )}
        <button
          onClick={toggleFullscreen}
          className="neobrutalism-btn cursor-pointer !border-2 !py-1 sm:!py-1.5 px-2 sm:px-3 text-[10px] sm:text-xs"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? "↙" : "⛶"}{" "}
          <span className="hidden sm:inline">
            {isFullscreen ? "Exit" : "Fullscreen"}
          </span>
        </button>
      </div>

      {/* Bottom Feedback Badge */}
      <div className="hidden sm:block absolute bottom-4 left-4 z-20 max-w-[85%] neobrutalism-box !border-2 bg-[#facc15] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-black transition-all duration-500">
        {displayedFeedback}
      </div>

      {showLoading ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#fbf0d9] p-4 text-center">
          {/* Normal, simple spinner with adjusted thickness for better UI scaling */}
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-black" />

          {/* Short, direct text */}
          <div className="text-xs font-bold uppercase tracking-wider text-black">
            {isActive ? "Analyzing..." : "Standby"}
          </div>
        </div>
      ) : imageSrc ? (
        <div className="relative h-full w-full bg-black flex items-center justify-center">
          <img
            key={imageSrc.slice(0, 24)}
            src={imageSrc}
            alt="Processed Feed"
            className="h-full w-full object-contain opacity-0 transition-opacity duration-300 ease-out animate-[fadeIn_300ms_ease-out_forwards]"
          />
          {roi && (
            <div className="absolute right-4 bottom-4 z-20 animate-[floatBadge_1s_ease-in-out_infinite] neobrutalism-box !border-2 bg-[#22c55e] px-3 py-1.5 text-xs font-bold uppercase">
              Face Detected [ {roi.w}x{roi.h} ]
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#fbf0d9] text-center">
          <div className="text-sm font-bold uppercase tracking-wide">
            {isActive ? "Waiting for camera..." : "Camera Off"}
          </div>
          <div className="text-xs font-bold uppercase">
            {isActive
              ? "Move your face into frame"
              : "Turn the camera on to start"}
          </div>
        </div>
      )}
    </div>
  );
}
