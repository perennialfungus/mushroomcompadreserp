import { useEffect, useRef, useState } from "react";
import { Camera, ScanLine, XCircle } from "lucide-react";
import { Badge, Button } from "./ui";

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

type ScannerProps = {
  active: boolean;
  onResult: (value: string) => void;
};

export function Scanner({ active, onResult }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mode, setMode] = useState<"native" | "zxing" | "idle">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !videoRef.current) {
      return;
    }

    let cancelled = false;
    let stop: (() => void) | null = null;

    async function startNative(video: HTMLVideoElement) {
      const detector = new window.BarcodeDetector!({
        formats: ["qr_code", "data_matrix", "code_128"]
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }
      });
      video.srcObject = stream;
      await video.play();
      setMode("native");

      let frameId = 0;
      const scanFrame = async () => {
        if (cancelled) {
          return;
        }
        const codes = await detector.detect(video).catch(() => []);
        const value = codes[0]?.rawValue;
        if (value) {
          onResult(value);
          return;
        }
        frameId = window.requestAnimationFrame(scanFrame);
      };
      frameId = window.requestAnimationFrame(scanFrame);
      stop = () => {
        window.cancelAnimationFrame(frameId);
        stream.getTracks().forEach((track) => track.stop());
      };
    }

    async function startZxing(video: HTMLVideoElement) {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        video,
        (result) => {
          const value = result?.getText();
          if (value) {
            onResult(value);
          }
        }
      );
      setMode("zxing");
      stop = () => controls.stop();
    }

    async function start() {
      try {
        const video = videoRef.current;
        if (!video || !navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not available in this browser.");
        }

        if (window.BarcodeDetector) {
          await startNative(video);
        } else {
          await startZxing(video);
        }
      } catch (scanError) {
        if (!cancelled) {
          setError(scanError instanceof Error ? scanError.message : "Scanner could not start.");
          setMode("idle");
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [active, onResult]);

  return (
    <div className="scanner-panel">
      <div className="scanner-status">
        <Badge tone={mode === "idle" ? "warning" : "info"}>
          {mode === "native" ? <Camera aria-hidden="true" size={16} /> : <ScanLine aria-hidden="true" size={16} />}
          {mode === "native" ? "Native detector" : mode === "zxing" ? "ZXing fallback" : "Camera idle"}
        </Badge>
      </div>
      <video ref={videoRef} className="scanner-video" muted playsInline aria-label="Barcode scanner camera" />
      {error ? (
        <div className="scanner-error">
          <XCircle aria-hidden="true" size={18} />
          <span>{error}</span>
        </div>
      ) : null}
      <Button variant="secondary" type="button" onClick={() => videoRef.current?.play()}>
        <Camera aria-hidden="true" size={18} />
        Start camera
      </Button>
    </div>
  );
}
