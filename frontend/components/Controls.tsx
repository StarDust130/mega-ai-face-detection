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
      <div className=" items-center gap-2 neobrutalism-box px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] md:text-sm font-bold uppercase tracking-wide hidden md:flex">
        <div
          className={`h-2.5 w-2.5  sm:h-3 sm:w-3 rounded-full border-2 border-black ${status === "live" ? "bg-green-500 animate-pulse" : status === "connecting" ? "bg-yellow-400" : status === "error" ? "bg-red-500" : "bg-slate-300"}`}
        ></div>
        <span className="whitespace-nowrap hidden sm:block">
          {status === "live"
            ? "Live Detection"
            : status === "connecting"
              ? "Connecting..."
              : status === "error"
                ? "Error"
                : "Camera Off"}
        </span>
        <span className="whitespace-nowrap block sm:hidden">
          {status === "live"
            ? "Live"
            : status === "connecting"
              ? "Wait"
              : "Off"}
        </span>
      </div>

      <button
        onClick={onToggle}
        title={
          isActive
            ? "Stop camera and detection"
            : "Start camera to begin AI detection"
        }
        className={`neobrutalism-btn whitespace-nowrap cursor-pointer text-[10px] sm:text-xs md:text-sm px-3 md:px-6 py-1.5 sm:py-2 ${isActive ? "neobrutalism-btn-danger" : "neobrutalism-btn-primary"}`}
      >
        {isActive ? "Stop" : "Start Tracking"}
      </button>
    </div>
  );
}
