export const SHIFT_TIMES = {
  morning: { start: "06:00", end: "14:00", duration: 8 },
  afternoon: { start: "14:00", end: "22:00", duration: 8 },
  night: { start: "22:00", end: "06:00", duration: 8 },
} as const;

export type AvailabilityType = keyof typeof SHIFT_TIMES;
