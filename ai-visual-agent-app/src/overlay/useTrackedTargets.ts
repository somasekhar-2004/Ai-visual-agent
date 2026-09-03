import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gyroscope } from "expo-sensors";

import type { VisualTarget } from "../types";
import type { Size } from "./coordinateMapping";

/**
 * TRACKING APPROACH - see README.md "Live tracking approach" for the full writeup. Short version:
 *
 * True visual object tracking (optical flow / Lucas-Kanade, the way Google Lens does it) needs a
 * per-frame pixel stream, which on Expo means `react-native-vision-camera` frame processors - a
 * native module that is NOT part of the Expo Go sandbox, requiring a custom dev client, plus a
 * native (not pure-JS) tracking implementation (e.g. wrapping OpenCV) to run fast enough at
 * camera framerate. That's real, substantial native engineering that cannot be built *and
 * verified* from this sandboxed environment (no camera, no device, no Xcode/Android Studio here).
 *
 * What CAN be built and shipped today, staying on Expo Go: compensate the overlay's position for
 * the phone's own ROTATION (not the object's independent motion) using the gyroscope, which is a
 * standard bundled Expo sensor - no native module, no dev client. This is a well-established
 * lightweight technique ("inertial dead-reckoning" / motion-compensated re-projection) used by
 * simple AR-overlay and annotation apps that don't do full visual SLAM. It is NOT the same thing
 * as real object tracking:
 *   - It only compensates for the CAMERA rotating (yaw/pitch) - not the camera translating
 *     sideways, and not the object itself moving independently of the camera.
 *   - It drifts the longer it goes without a fresh Gemini anchor (this app re-anchors on every
 *     analyze/verify response, which bounds the drift to whatever accumulates in a few seconds).
 *   - The angle->pixel conversion assumes a fixed camera field of view (ASSUMED_HORIZONTAL_FOV_DEGREES
 *     below) since there's no way to query the real device's FOV from expo-camera - this is a
 *     reasonable approximation for a typical rear phone camera, not a calibrated value.
 *   - The axis sign convention (which way is "yaw" vs "pitch" for the gyroscope's x/y/z) is set
 *     from the standard mobile device-axis convention but is UNVERIFIED against a real device -
 *     see the sign-flip note below if the box drifts the wrong way on your phone.
 */
const ASSUMED_HORIZONTAL_FOV_DEGREES = 68;
const GYRO_UPDATE_INTERVAL_MS = 50; // 20Hz sampling of the gyroscope itself
const RENDER_TICK_INTERVAL_MS = 66; // ~15fps re-render of the overlay's computed offset - the
// camera preview itself is always native/live at full rate regardless of this; this only
// throttles how often the JS-side SVG overlay recomputes its position, to avoid re-rendering on
// every single 20Hz gyro sample.
// Above this accumulated rotation (~35 degrees) since the last anchor, the small-angle
// approximation this technique relies on breaks down badly - clamp rather than let the box fly
// off to an absurd position.
const MAX_COMPENSATION_RADIANS = 0.6;

export interface RotationSnapshot {
  x: number;
  y: number;
}

export interface TrackedTargetsResult {
  /** Targets from the most recent Gemini response - render these through the normal coordinate
   * mapping, then shift the whole group by `pixelOffset`. */
  activeTargets: VisualTarget[];
  /** Estimated on-screen pixel shift, from camera rotation, since `activeTargets`' frame was
   * captured. Apply as a uniform translation to the whole overlay group. */
  pixelOffset: { dx: number; dy: number };
  /** Call the instant a frame is captured for sending to the backend. Store the returned value
   * and pass it to setTargets() once the matching response arrives. */
  markCaptureMoment: () => RotationSnapshot;
  /** Call with a new Gemini response's targets and the snapshot markCaptureMoment() returned for
   * that same request. */
  setTargets: (targets: VisualTarget[], captureSnapshot: RotationSnapshot) => void;
  /** False if the device has no gyroscope (or it's otherwise unavailable) - pixelOffset then
   * stays {0,0} always, i.e. the overlay simply holds its last known position until the next
   * Gemini response, which is a safe, sane fallback rather than a broken one. */
  motionAvailable: boolean;
}

export function useTrackedTargets(containerSize: Size | null): TrackedTargetsResult {
  const rotIntegralRef = useRef<RotationSnapshot>({ x: 0, y: 0 });
  const lastSampleTimeRef = useRef<number | null>(null);
  const anchorSnapshotRef = useRef<RotationSnapshot>({ x: 0, y: 0 });

  const [motionAvailable, setMotionAvailable] = useState(false);
  const [activeTargets, setActiveTargets] = useState<VisualTarget[]>([]);
  const [renderTick, setRenderTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    let subscription: { remove: () => void } | null = null;

    Gyroscope.isAvailableAsync()
      .then((available) => {
        if (!mounted) return;
        setMotionAvailable(available);
        if (!available) return;

        Gyroscope.setUpdateInterval(GYRO_UPDATE_INTERVAL_MS);
        subscription = Gyroscope.addListener(({ x, y, timestamp }) => {
          const last = lastSampleTimeRef.current;
          lastSampleTimeRef.current = timestamp;
          if (last === null) return; // first sample - no dt to integrate yet
          // Clamp dt so a long gap (app backgrounded, debugger pause) can't integrate one huge
          // spurious jump when sampling resumes.
          const dt = Math.max(0, Math.min(timestamp - last, 0.5));
          rotIntegralRef.current = {
            x: rotIntegralRef.current.x + x * dt,
            y: rotIntegralRef.current.y + y * dt,
          };
        });
      })
      .catch(() => {
        if (mounted) setMotionAvailable(false);
      });

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (!motionAvailable) return;
    const id = setInterval(() => setRenderTick((t) => t + 1), RENDER_TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [motionAvailable]);

  const markCaptureMoment = useCallback((): RotationSnapshot => {
    return { ...rotIntegralRef.current };
  }, []);

  const setTargets = useCallback((targets: VisualTarget[], captureSnapshot: RotationSnapshot) => {
    anchorSnapshotRef.current = captureSnapshot;
    setActiveTargets(targets);
  }, []);

  const pixelOffset = useMemo(() => {
    if (!containerSize || !motionAvailable) return { dx: 0, dy: 0 };

    const deltaYaw = clamp(
      rotIntegralRef.current.y - anchorSnapshotRef.current.y,
      -MAX_COMPENSATION_RADIANS,
      MAX_COMPENSATION_RADIANS,
    );
    const deltaPitch = clamp(
      rotIntegralRef.current.x - anchorSnapshotRef.current.x,
      -MAX_COMPENSATION_RADIANS,
      MAX_COMPENSATION_RADIANS,
    );

    const hFovRad = (ASSUMED_HORIZONTAL_FOV_DEGREES * Math.PI) / 180;
    const focalPxX = containerSize.width / 2 / Math.tan(hFovRad / 2);
    const vFovRad = 2 * Math.atan(Math.tan(hFovRad / 2) * (containerSize.height / containerSize.width));
    const focalPxY = containerSize.height / 2 / Math.tan(vFovRad / 2);

    // Standard mobile device-axis convention: gyroscope Y = rotation about the device's
    // vertical/long axis (yaw, turning left/right) -> shifts the view horizontally. Gyroscope X =
    // rotation about the device's horizontal axis (pitch, tilting up/down) -> shifts the view
    // vertically. NOT verified against a real device - if the box drifts the wrong direction when
    // you test this, flip the sign of dx and/or dy here.
    const dx = -deltaYaw * focalPxX;
    const dy = deltaPitch * focalPxY;
    return { dx, dy };
    // renderTick is a deliberate dependency, not a mistake - it's what makes this recompute on
    // the throttled interval above (reading the live rotIntegralRef/anchorSnapshotRef each time)
    // instead of only when activeTargets/containerSize themselves change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerSize, motionAvailable, activeTargets, renderTick]);

  return { activeTargets, pixelOffset, markCaptureMoment, setTargets, motionAvailable };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
