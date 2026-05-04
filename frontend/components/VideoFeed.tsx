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

  const [displayedFeedback, setDisplayedFeedback] = useState(
    "Looking for your cool face... 👀",
  );
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (status !== "live") {
      setDisplayedFeedback("Looking for your cool face... 👀");
      return;
    }

    let isMounted = true;

    const compliments = [
      "You look stunning today! ✨",
      "Such a beautiful smile! 😊",
      "That angle looks amazing on you! 🔥",
      "You are radiating good energy! 🌟",
      "Absolutely flawless! 👑",
      "Your vibe is absolutely immaculate! 🌈",
      "Main character energy detected! 🎬",
      "Looking sharp and ready to conquer! 🚀",
      "The camera naturally loves you! 📸",
      "10/10 perfection right there! 💯",
      "Just stepped out of a fashion magazine! 💅",
      "Incredible style and presence! 🤩",
      "Your skin is completely glowing! 💖",
      "Unmatched confidence levels! ⚡",
      "Iconic look! Period. 💫",
    ];

    let timeoutId: NodeJS.Timeout;

    const cycleCompliment = () => {
      // Trigger fade out
      setFade(true);

      setTimeout(() => {
        if (!isMounted) return;
        // Change text while faded out
        setDisplayedFeedback(
          compliments[Math.floor(Math.random() * compliments.length)],
        );
        // Trigger fade in
        setFade(false);

        // Schedule next cycle between 3 and 5 seconds
        const nextDelay = Math.random() * 2000 + 3000;
        timeoutId = setTimeout(cycleCompliment, nextDelay);
      }, 300); // 300ms fade duration
    };

    // Initial 5 second delay before first compliment
    timeoutId = setTimeout(cycleCompliment, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [status]);

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
          {isFullscreen ? "↙ " : "⛶ "}{" "}
          <span className="hidden sm:inline">
            {isFullscreen ? "Exit" : `${" "}Fullscreen`}
          </span>
        </button>
      </div>

      {/* Bottom Feedback Badge */}
      <div
        className={`hidden sm:block absolute bottom-4 left-4 z-20 max-w-[85%] neobrutalism-box !border-2 bg-[#facc15] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-black transition-opacity duration-300 ${fade ? "opacity-0" : "opacity-100"}`}
      >
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
