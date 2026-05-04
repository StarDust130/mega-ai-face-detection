"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Camera } from "../components/Camera";
import { VideoFeed } from "../components/VideoFeed";
import { Controls } from "../components/Controls";
import { WSClient } from "../utils/ws";
import Image from "next/image";

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
        <header className="neobrutalism-box w-full px-3 py-3 bg-[#90c4ff]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/mega-ai-logo.png"
                  alt="Mega AI Logo"
                  width={150}
                  height={150}
                />
              </div>
            </div>
            <Controls
              isActive={isActive}
              onToggle={handleToggle}
              status={status}
            />
          </div>
        </header>

        {isActive || status !== "idle" ? (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 md:items-start">
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
              <div className="w-full neobrutalism-box overflow-hidden bg-white p-2">
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
                  className={`neobrutalism-box !border-2 px-2 py-0.5 text-[10px] font-bold uppercase ${status === "live" ? "bg-[#22c55e] " : "bg-white text-black"}`}
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
          <section className="flex flex-col items-center justify-center py-20 px-4 min-h-[50vh] text-center gap-6">
            <Image
              src="/dance.gif"
              alt="Dancing Animation"
                width={200}
                height={200}
             
            />
            <h2 className="text-2xl  font-bold uppercase tracking-tight max-w-xl leading-tight">
              Start camera to see your cool face 😎
            </h2>
            <button
              onClick={handleToggle}
              className="neobrutalism-btn neobrutalism-btn-primary mt-4 py-3 px-8 text-lg flex gap-2 items-center cursor-pointer hover transition-colors"
            >
              Start Camera
            </button>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-8 mb-4 border-t-4 border-black pt-4 flex flex-col md:flex-row items-center justify-between gap-4 font-bold uppercase text-sm">
          <a
            href="https://github.com/StarDust130/mega-ai-face-detection"
            target="_blank"
            rel="noopener noreferrer"
            className="neobrutalism-btn text-xs bg-[#e2e8f0]"
          >
            ⭐ View on GitHub
          </a>
          <span>
            Created by{" "}
            <a
              href="https://chandrashekhar.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ef4444] neobrutalism-box !border-2 px-2 py-1 hover:bg-[#ef4444] hover: transition-colors"
            >
              Chandrashekhar
            </a>
          </span>
        </footer>
      </div>
    </main>
  );
}
