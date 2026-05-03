"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Camera } from "../components/Camera";
import { VideoFeed } from "../components/VideoFeed";
import { Controls } from "../components/Controls";
import { WSClient } from "../utils/ws";

export default function Home() {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "live" | "error"
  >("idle");
  const [processedFrame, setProcessedFrame] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [aiFeedback, setAiFeedback] = useState("Ready when you are.");
  const [roi, setRoi] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const wsClient = useRef<WSClient | null>(null);

  const positiveMessages = [
    "😎 Looking sharp!",
    "🔥 Nice jawline detected",
    "😊 Good smile!",
    "✨ Clean face lock",
  ];
  const angleMessages = [
    "🤔 Turn a bit for better angle",
    "📐 Move closer to center",
    "👀 Try brighter light",
  ];

  const pickMessage = (list: string[]) =>
    list[Math.floor(Math.random() * list.length)];

  // 🔌 Connect WebSocket when active
  useEffect(() => {
    if (isActive) {
      setStatus("connecting");
      console.log("🔌 Connecting to backend WebSocket...");
      wsClient.current = new WSClient("ws://localhost:8000/ws/video");
      wsClient.current.connect(
        (data) => {
          console.log("📦 Frame response received:", data);
          setFrameCount((current) => current + 1);
          if (data?.image) {
            setProcessedFrame(data.image);
          }
          if (Object.prototype.hasOwnProperty.call(data ?? {}, "roi")) {
            setRoi(data.roi ?? null);
          }
          setAiFeedback(
            data?.roi
              ? pickMessage(positiveMessages)
              : pickMessage(angleMessages),
          );
        },
        () => {
          console.log("✅ WebSocket connected, live detection running");
          setStatus("live");
        },
        () => {
          console.log("⚠️ WebSocket closed");
          setStatus(isActive ? "connecting" : "idle");
          setAiFeedback(
            isActive ? "🔄 Reconnecting to the model..." : "Camera off.",
          );
        },
        () => {
          console.log("❌ WebSocket error");
          setStatus("error");
          setAiFeedback("⚠️ Backend connection issue");
        },
      );
    } else {
      if (wsClient.current) {
        wsClient.current.disconnect();
        wsClient.current = null;
      }
      setStatus("idle");
      setProcessedFrame(null);
      setRoi(null);
      setAiFeedback("Ready when you are.");
      setFrameCount(0);
    }

    return () => {
      if (wsClient.current) {
        wsClient.current.disconnect();
      }
    };
  }, [isActive]);

  // 📤 Send frame to backend
  const handleFrame = useCallback((base64Image: string) => {
    if (
      wsClient.current &&
      wsClient.current.socket?.readyState === WebSocket.OPEN
    ) {
      console.log("📤 Sending frame to backend", base64Image.length);
      wsClient.current.send(base64Image);
    }
  }, []);

  const showOutput = status !== "idle";
  const isAnalyzing =
    status === "connecting" || (status === "live" && !processedFrame);

  return (
    <main className="min-h-screen px-4 py-4 md:px-8 md:py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:gap-5">
        {/* 🏷️ Header */}
        <header className="neubrutalism-box w-full bg-white px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="neubrutalism-title text-2xl font-extrabold md:text-4xl">
                MEGA·AI FACE DETECT
              </h1>
              <p className="max-w-2xl text-sm font-medium leading-6 md:text-base">
                Premium real-time face tracking with live ROI feedback, clean
                motion, and a playful AI vibe.
              </p>
            </div>
            <Controls
              isActive={isActive}
              onToggle={() => setIsActive(!isActive)}
              status={status}
            />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          {/* INPUT */}
          <div className="order-2 flex flex-col gap-3 md:order-1 md:col-span-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.22em] md:text-base">
                Input Preview
              </h2>
              <span className="rounded-none border-2 border-black bg-[#fff3a6] px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_#000] md:text-xs">
                Camera
              </span>
            </div>
            <div className="overflow-hidden neubrutalism-box bg-white p-2 md:p-3">
              <Camera isActive={isActive} onFrame={handleFrame} />
            </div>
          </div>

          {/* OUTPUT */}
          <div className="order-1 flex flex-col gap-3 md:order-2 md:col-span-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.22em] md:text-base">
                  Output Stream
                </h2>
                <p className="text-xs font-medium text-black/70 md:text-sm">
                  {isAnalyzing
                    ? "AI analyzing..."
                    : status === "live"
                      ? "Live output ready"
                      : "Waiting for camera..."}
                </p>
              </div>
              <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000]">
                <span
                  className={`h-2.5 w-2.5 ${status === "live" ? "bg-green-500" : status === "connecting" ? "bg-yellow-400" : "bg-red-500"}`}
                />
                <span className="text-xs font-black uppercase md:text-sm">
                  {status === "live"
                    ? "Live"
                    : status === "connecting"
                      ? "Connecting"
                      : status === "error"
                        ? "Off"
                        : "Off"}
                </span>
              </div>
            </div>

            <VideoFeed
              imageSrc={processedFrame}
              roi={roi}
              isActive={showOutput}
              status={status}
              frameCount={frameCount}
              aiFeedback={aiFeedback}
            />

            <div className="flex flex-wrap items-center gap-2">
              <span className="border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase shadow-[2px_2px_0_#000]">
                {roi
                  ? `Face Detected · ${roi.w}x${roi.h}`
                  : isAnalyzing
                    ? "AI analyzing..."
                    : "No face detected"}
              </span>
              <span className="border-2 border-black bg-[#fff3a6] px-3 py-2 text-xs font-bold shadow-[2px_2px_0_#000]">
                {aiFeedback}
              </span>
              <span className="border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase shadow-[2px_2px_0_#000]">
                Frames {frameCount}
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
