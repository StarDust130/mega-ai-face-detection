"use client";
import React from "react";

interface ControlsProps {
  isActive: boolean;
  onToggle: () => void;
  status: "idle" | "connecting" | "live" | "error";
}

export function Controls({ isActive, onToggle, status }: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {/* Status indicator */}
      <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase shadow-[2px_2px_0_#000] md:text-sm">
        <div
          className={`h-3 w-3 border border-black ${status === "live" ? "bg-green-500 animate-pulse" : status === "connecting" ? "bg-yellow-400" : status === "error" ? "bg-red-600" : "bg-red-500"}`}
        ></div>
        <span className="uppercase text-sm">
          {status === "live"
            ? "Live Detection"
            : status === "connecting"
              ? "Connecting..."
              : status === "error"
                ? "Connection Error"
                : "Camera Off"}
        </span>
      </div>

      <button
        onClick={onToggle}
        title={
          isActive
            ? "Stop camera and detection"
            : "Start camera to begin AI detection"
        }
        className={`neubrutalism-button px-4 py-2 text-sm shadow-[2px_2px_0_#000] transition-transform hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-[1px_1px_0_#000] ${isActive ? "stop" : ""}`}
      >
        {isActive ? "🛑 Stop" : "🎥 Start"}
      </button>
    </div>
  );
}
