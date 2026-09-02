"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { VisualTarget } from "@/lib/vision/types";

interface CameraOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  targets: VisualTarget[];
  active: boolean;
}

const ACCENT = "#22d3ee"; // cyan-400
const ACCENT_DIM = "rgba(34, 211, 238, 0.35)";

/**
 * Draws bounding boxes / circles / numbered markers on a canvas positioned above the <video>.
 * Handles the object-fit:cover mapping from normalized (0-1) source coordinates to on-screen
 * pixels, and stays aligned across resizes / orientation changes via ResizeObserver + rAF.
 */
export function CameraOverlay({ videoRef, targets, active }: CameraOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetsRef = useRef(targets);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));
      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const list = targetsRef.current;
      if (!vw || !vh || !list.length) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // object-fit: cover mapping from intrinsic video size to displayed container size.
      const scale = Math.max(cssW / vw, cssH / vh);
      const dispW = vw * scale;
      const dispH = vh * scale;
      const offsetX = (cssW - dispW) / 2;
      const offsetY = (cssH - dispH) / 2;

      for (const target of list) {
        if (!target.boundingBox) continue;
        const { x, y, width, height } = target.boundingBox;
        const px = offsetX + x * dispW;
        const py = offsetY + y * dispH;
        const pw = width * dispW;
        const ph = height * dispH;
        const cx = px + pw / 2;
        const cy = py + ph / 2;

        ctx.save();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = ACCENT;
        ctx.fillStyle = ACCENT_DIM;

        if (target.shape === "circle") {
          const r = Math.max(pw, ph) / 2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (target.shape === "point") {
          ctx.beginPath();
          ctx.moveTo(cx - 10, cy);
          ctx.lineTo(cx + 10, cy);
          ctx.moveTo(cx, cy - 10);
          ctx.lineTo(cx, cy + 10);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fillStyle = ACCENT;
          ctx.fill();
        } else {
          const radius = 8;
          ctx.beginPath();
          ctx.roundRect(px, py, pw, ph, radius);
          ctx.fill();
          ctx.stroke();
        }

        // Numbered marker badge (top-left of the shape) - readable without relying on color.
        const badgeR = 12;
        const badgeX = px + badgeR + 2;
        const badgeY = py - badgeR - 2 < 0 ? py + badgeR + 2 : py - badgeR - 2;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = ACCENT;
        ctx.fill();
        ctx.fillStyle = "#022c33";
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(target.marker), badgeX, badgeY + 0.5);

        // Label
        ctx.font = "600 12px system-ui, sans-serif";
        const label = target.label;
        const labelY = py + ph + 4;
        const metrics = ctx.measureText(label);
        const padX = 6;
        const labelW = metrics.width + padX * 2;
        const labelH = 18;
        const labelX = Math.min(Math.max(px, 0), Math.max(cssW - labelW, 0));
        ctx.fillStyle = "rgba(2, 6, 23, 0.75)";
        ctx.beginPath();
        ctx.roundRect(labelX, labelY, labelW, labelH, 4);
        ctx.fill();
        ctx.fillStyle = "#e5faff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(label, labelX + padX, labelY + labelH / 2 + 0.5);

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const resizeObserver = new ResizeObserver(() => {
      /* redraw loop already picks up new size every frame */
    });
    resizeObserver.observe(canvas);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: active ? 1 : 0, transition: "opacity 200ms ease" }}
    />
  );
}
