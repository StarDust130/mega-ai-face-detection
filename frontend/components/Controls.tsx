"use client";
import React from "react";

interface ControlsProps {
  isActive: boolean;
  onToggle: () => void;
  status: "idle" | "connecting" | "live" | "error";
}

export function Controls({ isActive, onToggle, status }: ControlsProps) {
  return (
    <div className="flex items-center justify-end gap-2 md:gap-4 flex-shrink-0">
      {/* Status indicator */}
      <div className="hidden sm:flex items-center gap-2 neobrutalism-box px-3 py-2 text-xs font-bold uppercase tracking-wide md:text-sm">
        <div
          className={`h-3 w-3 rounded-full border-2 border-black ${status === "live" ? "bg-green-500 animate-pulse" : status === "connecting" ? "bg-yellow-400" : status === "error" ? "bg-red-500" : "bg-slate-300"}`}
        ></div>
        <span className="whitespace-nowrap">
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
        className={`neobrutalism-btn whitespace-nowrap cursor-pointer text-xs md:text-sm px-3 md:px-6 py-2 ${isActive ? "neobrutalism-btn-danger" : "neobrutalism-btn-primary"}`}
      >
        {isActive ? "Stop Camera" : "Start Camera"}
      </button>
    </div>
  );
}
