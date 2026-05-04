"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Camera } from "../components/Camera";
import { VideoFeed } from "../components/VideoFeed";
import { Controls } from "../components/Controls";
import { WSClient } from "../utils/ws";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "live" | "error"
  >("idle");
  const [processedFrame, setProcessedFrame] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [aiFeedback, setAiFeedback] = useState("Looking for your cool face...");
  const [roi, setRoi] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const wsClient = useRef<WSClient | null>(null);

  const positiveMessages = useRef([
    "You look stunning today!",
    "Such a beautiful smile!",
    "That angle looks amazing on you!",
    "You are radiating good energy!",
    "Absolutely flawless!",
  ]);
  const angleMessages = useRef([
    "Searching for your gorgeous face...",
    "Adjusting parameters for perfection...",
  ]);

  const pickMessage = (list: string[]) =>
    list[Math.floor(Math.random() * list.length)];

  // Connect WebSocket when active
  useEffect(() => {
    if (isActive) {
      wsClient.current = new WSClient("ws://localhost:8000/ws/video");
      wsClient.current.connect(
        (dataRaw) => {
          const data = dataRaw as {
            image?: string;
            roi?: { x: number; y: number; w: number; h: number };
          };
          setFrameCount((current) => current + 1);
          if (data?.image) {
            setProcessedFrame(data.image);
          }
          if (Object.prototype.hasOwnProperty.call(data ?? {}, "roi")) {
            setRoi(data.roi ?? null);
          }
          setAiFeedback(
            data?.roi
              ? pickMessage(positiveMessages.current)
              : pickMessage(angleMessages.current),
          );
        },
        () => {
          setStatus("live");
        },
        () => {
          if (wsClient.current) {
            setStatus("error");
          }
        },
        () => {
          setStatus("error");
          setAiFeedback("Backend connection issue.");
        },
      );
    }

    return () => {
      if (wsClient.current) {
        wsClient.current.disconnect();
      }
    };
  }, [isActive]);

  const handleFrame = useCallback((base64Image: string) => {
    if (
      wsClient.current &&
      wsClient.current.socket?.readyState === WebSocket.OPEN
    ) {
      wsClient.current.send(base64Image);
    }
  }, []);

  const showOutput = status !== "idle" && status !== "error";

  const handleToggle = () => {
    if (!isActive) {
      setStatus("connecting");
      setIsActive(true);
    } else {
      setIsActive(false);
      if (wsClient.current) {
        wsClient.current.disconnect();
        wsClient.current = null;
      }
      setStatus("idle");
      setProcessedFrame(null);
      setRoi(null);
      setAiFeedback("Looking for your cool face...");
      setFrameCount(0);
    }
  };

return (
  <main className="min-h-screen px-3 py-3">
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Header */}
      <header className="neobrutalism-box w-full bg-white px-4 py-3 md:px-6 md:py-4">
        {/* Fix: Unified flex-row layout for all devices to keep logo and controls on one line */}
        <div className="flex flex-row items-center justify-between gap-4 md:gap-6">
          {/* Left Column: Logo - Integrated text and structured badge, NO IMAGES */}
          <div className="flex items-center justify-start gap-2 md:gap-3">
            {/* Fix: Refined 'AI' text badge: sharp corners, precise neubrutalist texture, centered bold white text */}
            <Image
              src="/icon.png"
              alt="AI Logo"
              width={32}
              height={32}
              className="object-contain md:h-8 md:w-8"
            />
            {/* Fix: Clean, bold text: tight tracking and uppercase for cool UI */}
            <h1 className="flex items-center text-lg font-black uppercase tracking-tighter text-black md:text-3xl">
              Face Detection
            </h1>
          </div>

          {/* Center Column: Empty - Balancing the logo and controls for 'normal' UI */}
          <div className="hidden md:flex flex-grow justify-center"></div>

          {/* Right Column: Controls - Two structured buttons, NO IMAGES */}
          <div className="flex items-center justify-end">
            <Controls
              isActive={isActive}
              onToggle={handleToggle}
              status={status}
            />
          </div>
        </div>
      </header>

      {isActive || status !== "idle" ? (
        <section className="grid grid-cols-1 gap-6 md:items-start lg:grid-cols-12">
          {/* INPUT (30%) */}
          <div className="order-2 flex flex-col gap-3 lg:order-1 lg:col-span-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Source
              </h2>
              <span className="neobrutalism-box !border-2 bg-white px-2 py-0.5 text-[10px] font-bold uppercase">
                Webcam
              </span>
            </div>
            <div className="neobrutalism-box w-full overflow-hidden bg-white p-2">
              <Camera isActive={isActive} onFrame={handleFrame} />
            </div>
          </div>

          {/* OUTPUT (70%) */}
          <div className="order-1 flex flex-col gap-3 lg:order-2 lg:col-span-8">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Live Feed
              </h2>
              <span
                className={`neobrutalism-box !border-2 px-2 py-0.5 text-[10px] font-bold uppercase ${status === "live" ? "bg-[#22c55e]" : "bg-white text-black"}`}
              >
                {status === "live" ? "Processing" : "Standby"}
              </span>
            </div>

            <VideoFeed
              imageSrc={processedFrame}
              roi={roi}
              isActive={showOutput}
              status={status}
              frameCount={frameCount}
              aiFeedback={aiFeedback}
              onToggle={handleToggle}
            />
          </div>
        </section>
      ) : (
        <section className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 py-20 text-center">
          <Image
            src="/dance.gif"
            alt="Dancing Animation"
            width={200}
            height={200}
          />
          <h2 className="max-w-xl text-2xl font-bold uppercase leading-tight tracking-tight">
            Start camera to see your cool face 😎
          </h2>
          <button
            title={
              isActive
                ? "Stop camera and detection"
                : "Start camera to begin AI detection"
            }
            onClick={handleToggle}
            className="neobrutalism-btn neobrutalism-btn-primary mt-4 flex cursor-pointer items-center gap-2 px-8 py-3 text-lg transition-colors hover:bg-black hover:text-white"
          >
            Start Camera
          </button>
        </section>
      )}

      {/* Footer */}
      <footer className="relative mt-16 mb-4 flex  items-start justify-between gap-4 border-t-4 border-black pt-4 text-left text-sm font-bold uppercase flex-row md:items-center">
        {/* The GIF absolutely positioned to run exactly on top of the right side of the border */}
        <div className="absolute right-4 -top-12 md:right-8 md:-top-16">
          <Image
            src="/run.webp"
            alt="Running Animation"
            width={48}
            height={48}
            className="object-contain md:h-16 md:w-16"
            unoptimized
          />
        </div>

        <a
          href="https://github.com/StarDust130/mega-ai-face-detection"
          target="_blank"
          rel="noopener noreferrer"
          className="neobrutalism-btn bg-[#e2e8f0] text-xs"
        >
          ⭐ View on GitHub
        </a>

        <span>
          <span className="text-xs hidden md:block">Created by</span>{" "}
          <Link
            href="https://chandrashekhar.me"
            target="_blank"
            rel="noopener noreferrer"
            className="neobrutalism-box inline-block !border-2 px-2 py-1 text-[#ef4444] transition-colors hover:bg-[#ef4444] hover:text-white"
          >
            Chandrashekhar
          </Link>
        </span>
      </footer>
    </div>
  </main>
);
}