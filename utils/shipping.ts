import { ShippingConfig } from '../types';

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function pickUrgencyMultiplier(
  slot: Date,
  now: Date,
  m: ShippingConfig['urgency_multipliers']
): number {
  if (isSameDay(slot, now)) {
    const hoursAway = (slot.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursAway < 0.5) return m.urgent_now;
    if (hoursAway < 5) return m.same_day_within_5h;
    return m.same_day_after_5h;
  }
  return m.next_day_or_later;
}

export function computeShipping(
  distanceKm: number,
  selectedSlot: Date,
  now: Date,
  config: ShippingConfig
): number {
  const distanceCharge =
    Math.max(0, distanceKm - config.free_distance_km) * config.per_km_rate_sar;
  const base = config.base_fee_sar + distanceCharge;
  const multiplier = pickUrgencyMultiplier(selectedSlot, now, config.urgency_multipliers);
  return Math.round(base * multiplier * 100) / 100;
}

export function isWithinOperatingHours(config: ShippingConfig): boolean {
  const tz = config.operating_hours.timezone;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  const now = h * 60 + m;
  const [sh, sm] = config.operating_hours.start.split(':').map(Number);
  const [eh, em] = config.operating_hours.end.split(':').map(Number);
  return now >= sh * 60 + sm && now < eh * 60 + em;
}
