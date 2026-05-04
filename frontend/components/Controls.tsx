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
      <div className="flex items-center gap-2 neobrutalism-box px-3 py-2 text-xs font-bold uppercase tracking-wide md:text-sm">
        <div
          className={`h-3 w-3 rounded-full border-2 border-black ${status === "live" ? "bg-green-500 animate-pulse" : status === "connecting" ? "bg-yellow-400" : status === "error" ? "bg-red-500" : "bg-slate-300"}`}
        ></div>
        <span>
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
        className={`neobrutalism-btn text-sm ${isActive ? "neobrutalism-btn-danger" : "neobrutalism-btn-primary"}`}
      >
        {isActive ? "Stop AI" : "Start Tracking"}
      </button>
    </div>
  );
}
