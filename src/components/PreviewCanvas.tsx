import React, { useEffect, useRef } from "react";
import {
  DeveloperOverlayState,
  DevicePreset,
  Orientation,
  PreviewStatus,
  WorkspaceSettings,
} from "../types/device";
import { DeviceFrame } from "./DeviceFrame";

interface PreviewCanvasProps {
  device: DevicePreset;
  width: number;
  height: number;
  orientation: Orientation;
  effectiveScale: number;
  url: string;
  reloadKey: number;
  overlays: DeveloperOverlayState;
  canvasBackdrop: WorkspaceSettings["canvasBackdrop"];
  onCanvasResize: (availWidth: number, availHeight: number) => void;
  onStatusChange: (status: PreviewStatus) => void;
  onLoadSampleUrl: (sampleUrl: string) => void;
  onOpenNewTab: () => void;
  onReload: () => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  device,
  width,
  height,
  orientation,
  effectiveScale,
  url,
  reloadKey,
  overlays,
  canvasBackdrop,
  onCanvasResize,
  onStatusChange,
  onLoadSampleUrl,
  onOpenNewTab,
  onReload,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      // Leave comfortable breathing room for metadata pill, bezel, and helper footer
      onCanvasResize(Math.max(200, rect.width - 72), Math.max(200, rect.height - 128));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onCanvasResize]);

  const backdropClass =
    canvasBackdrop === "paper"
      ? "studio-canvas-paper"
      : canvasBackdrop === "slate"
      ? "studio-canvas-light"
      : "studio-canvas-dark";

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 overflow-auto dev-scroll ${backdropClass} p-6 sm:p-8`}
    >
      <div className="min-h-full min-w-full flex items-center justify-center">
        <DeviceFrame
          device={device}
          width={width}
          height={height}
          orientation={orientation}
          scale={effectiveScale}
          url={url}
          reloadKey={reloadKey}
          overlays={overlays}
          onStatusChange={onStatusChange}
          onLoadSampleUrl={onLoadSampleUrl}
          onOpenNewTab={onOpenNewTab}
          onReload={onReload}
        />
      </div>
    </div>
  );
};
