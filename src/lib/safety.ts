/**
 * Cheap, deterministic keyword safety net. This runs in addition to (never instead of)
 * asking the vision model to flag mains/high-voltage hazards it can see in the frame -
 * the two checks are combined by the caller.
 */

const HIGH_VOLTAGE_KEYWORDS = [
  "mains",
  "wall socket",
  "wall outlet",
  "power outlet",
  "110v",
  "115v",
  "120v",
  "220v",
  "230v",
  "240v",
  "high voltage",
  "high-voltage",
  "microwave",
  "breaker panel",
  "electrical panel",
  "fuse box",
  "power line",
  "utility pole",
  "transformer box",
  "wall wiring",
  "house wiring",
  "extension cord",
  "power strip",
  "ac outlet",
  "electric shock",
  "live wire",
  "power supply unit teardown",
  "capacitor bank",
];

export const SAFETY_STOP_MESSAGE =
  "I can't help with this. What you're describing sounds like mains or high-voltage equipment, " +
  "which is outside what this app is built to guide you through safely. Please disconnect it from " +
  "power and consult a qualified electrician. I can keep helping with low-voltage electronics like " +
  "Arduino, ESP32, breadboards, batteries, and small DC circuits.";

export interface SafetyCheckResult {
  triggered: boolean;
  reason: string;
}

export function checkTextForHighVoltage(text: string | null | undefined): SafetyCheckResult {
  if (!text) return { triggered: false, reason: "" };
  const lower = text.toLowerCase();
  const hit = HIGH_VOLTAGE_KEYWORDS.find((kw) => lower.includes(kw));
  if (hit) {
    return { triggered: true, reason: `User text mentioned "${hit}"` };
  }
  return { triggered: false, reason: "" };
}
