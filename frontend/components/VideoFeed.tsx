"use client";
import React from "react";

interface VideoFeedProps {
  imageSrc: string | null;
  roi: { x: number; y: number; w: number; h: number } | null;
  isActive: boolean;
  status: "idle" | "connecting" | "live" | "error";
  frameCount: number;
  aiFeedback: string;
}

export function VideoFeed({
  imageSrc,
  roi,
  isActive,
  status,
  frameCount,
  aiFeedback,
}: VideoFeedProps) {
  const hasFace = Boolean(roi);
  const showLoading =
    status === "connecting" || (status === "live" && !imageSrc);

  return (
    <div
      className={`relative w-full overflow-hidden neubrutalism-box bg-[#d9f4ff] transition-all duration-300 ${hasFace ? "shadow-[0_0_0_4px_#000,0_0_30px_rgba(255,144,232,0.35)]" : ""}`}
    >
      <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2">
        <span className="border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_#000] md:text-xs">
          {status === "live"
            ? "🟢 Live"
            : status === "connecting"
              ? "🟡 Connecting"
              : "🔴 Off"}
        </span>
        <span className="border-2 border-black bg-[#fff3a6] px-2 py-1 text-[10px] font-bold shadow-[2px_2px_0_#000] md:text-xs">
          {frameCount > 0 ? `Frame ${frameCount}` : "Waiting for camera"}
        </span>
      </div>

      <div className="absolute bottom-3 left-3 z-20 max-w-[80%] border-2 border-black bg-white/95 px-3 py-2 text-xs font-semibold shadow-[2px_2px_0_#000] md:text-sm">
        {aiFeedback}
      </div>

      {showLoading ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <div className="h-8 w-8 animate-spin border-4 border-black border-t-[#ff90e8]" />
          <div className="text-sm font-black uppercase tracking-[0.2em] md:text-base">
            AI analyzing...
          </div>
          <div className="text-xs font-medium text-black/70 md:text-sm">
            {isActive
              ? "Waiting for the first processed frame"
              : "Start the camera to begin detection"}
          </div>
        </div>
      ) : imageSrc ? (
        <div className="relative min-h-[320px] bg-black">
          <img
            key={imageSrc.slice(0, 24)}
            src={imageSrc}
            alt="Processed Feed"
            className="h-full w-full object-cover opacity-0 transition-all duration-300 ease-out animate-[fadeIn_300ms_ease-out_forwards]"
          />
          {roi && (
            <div className="absolute right-3 top-14 z-20 animate-[floatBadge_2.8s_ease-in-out_infinite] border-2 border-black bg-white px-3 py-2 text-xs font-black shadow-[2px_2px_0_#000] md:text-sm">
              Face Detected · {roi.w}x{roi.h}
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <div className="text-sm font-black uppercase tracking-[0.2em] md:text-base">
            {isActive ? "Waiting for camera..." : "Camera Off"}
          </div>
          <div className="text-xs font-medium text-black/70 md:text-sm">
            {isActive
              ? "Move your face into frame"
              : "Turn the camera on to start"}
          </div>
        </div>
      )}
    </div>
  );
}
