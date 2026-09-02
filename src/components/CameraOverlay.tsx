"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { VisualTarget } from "@/lib/vision/types";

interface CameraOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  targets: VisualTarget[];
  active: boolean;
}

const ACCENT = "#22d3ee"; // cyan-400 - "source" targets (what to act on)
const ACCENT_DIM = "rgba(34, 211, 238, 0.35)";
const DEST_ACCENT = "#f59e0b"; // amber-400 - "destination" targets (where it goes)
const DEST_ACCENT_DIM = "rgba(245, 158, 11, 0.35)";
const LINK_COLOR = "rgba(226, 232, 240, 0.85)"; // connecting line between a source and its destination

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

      // Screen-space center of every drawn target, keyed by id - filled in below as each target is
      // drawn, then used after the main loop to connect each "destination" target back to its
      // "source" with a short arrow (see the connector pass below the loop).
      const centers = new Map<string, { x: number; y: number }>();

      for (const target of list) {
        const hasPath = target.shape === "path" && target.path && target.path.length >= 2;
        if (!target.boundingBox && !hasPath) continue;

        const isDestination = target.role === "destination";
        const color = isDestination ? DEST_ACCENT : ACCENT;
        const colorDim = isDestination ? DEST_ACCENT_DIM : ACCENT_DIM;

        // Map normalized points through the same object-fit:cover transform as boxes below.
        const mapPoint = (nx: number, ny: number) => ({ x: offsetX + nx * dispW, y: offsetY + ny * dispH });

        let px: number, py: number, pw: number, ph: number;
        if (target.boundingBox) {
          const { x, y, width, height } = target.boundingBox;
          px = offsetX + x * dispW;
          py = offsetY + y * dispH;
          pw = width * dispW;
          ph = height * dispH;
        } else {
          // No boundingBox (a "path"-only target) - derive one from the path's extent so the
          // marker badge/label still have somewhere sensible to sit.
          const xs = target.path!.map((p) => p.x);
          const ys = target.path!.map((p) => p.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          px = offsetX + minX * dispW;
          py = offsetY + minY * dispH;
          pw = (maxX - minX) * dispW;
          ph = (maxY - minY) * dispH;
        }
        const cx = px + pw / 2;
        const cy = py + ph / 2;
        centers.set(target.id, { x: cx, y: cy });

        ctx.save();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = color;
        ctx.fillStyle = colorDim;

        if (hasPath) {
          // A traced polyline reads far better than a box for a wire that bends - a rectangle
          // around a curvy wire also covers whatever sits inside the bend.
          ctx.lineWidth = 4;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.beginPath();
          target.path!.forEach((pt, i) => {
            const p = mapPoint(pt.x, pt.y);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
          for (const pt of [target.path![0], target.path![target.path!.length - 1]]) {
            const p = mapPoint(pt.x, pt.y);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
          }
        } else if (target.shape === "circle") {
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

        // Numbered marker badge - anchored to the path's start when tracing a wire, otherwise
        // the top-left of the shape - readable without relying on color either way.
        const badgeAnchor = hasPath ? mapPoint(target.path![0].x, target.path![0].y) : { x: px, y: py };
        const badgeR = 12;
        const badgeX = badgeAnchor.x + badgeR + 2;
        const badgeY = badgeAnchor.y - badgeR - 2 < 0 ? badgeAnchor.y + badgeR + 2 : badgeAnchor.y - badgeR - 2;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.fillStyle = "#022c33";
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(target.marker), badgeX, badgeY + 0.5);

        // Label - destination markers are prefixed so the "move it here" meaning doesn't depend
        // on distinguishing amber from cyan alone.
        ctx.font = "600 12px system-ui, sans-serif";
        const label = isDestination ? `→ ${target.label}` : target.label;
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

      // Connector pass: for every "destination" target, draw a short dashed arrow from its
      // linked "source" target to it, so a "move this wire to there" instruction shows both what
      // to move and exactly where - not just two independent markers the user has to guess how
      // to relate to each other.
      for (const target of list) {
        if (target.role !== "destination" || !target.linkedTargetId) continue;
        const from = centers.get(target.linkedTargetId);
        const to = centers.get(target.id);
        if (!from || !to) continue;

        ctx.save();
        ctx.strokeStyle = LINK_COLOR;
        ctx.fillStyle = LINK_COLOR;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const headLen = 10;
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
          to.x - headLen * Math.cos(angle - Math.PI / 6),
          to.y - headLen * Math.sin(angle - Math.PI / 6),
        );
        ctx.lineTo(
          to.x - headLen * Math.cos(angle + Math.PI / 6),
          to.y - headLen * Math.sin(angle + Math.PI / 6),
        );
        ctx.closePath();
        ctx.fill();
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
