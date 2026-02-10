
import { Airport } from '../types';

/**
 * Calculates Great Circle distance between two points in KM
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculates bearing between two points
 */
export function getBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1R = lat1 * Math.PI / 180;
  const lat2R = lat2 * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2R);
  const x = Math.cos(lat1R) * Math.sin(lat2R) - Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

/**
 * Generates points along a Great Circle path for the curve
 */
export function interpolatePath(start: [number, number], end: [number, number], segments: number = 100): [number, number][] {
  const points: [number, number][] = [];
  const startLat = start[0] * Math.PI / 180;
  const startLon = start[1] * Math.PI / 180;
  const endLat = end[0] * Math.PI / 180;
  const endLon = end[1] * Math.PI / 180;

  const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((startLat - endLat) / 2), 2) +
            Math.cos(startLat) * Math.cos(endLat) * Math.pow(Math.sin((startLon - endLon) / 2), 2)));

  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(startLat) * Math.cos(startLon) + B * Math.cos(endLat) * Math.cos(endLon);
    const y = A * Math.cos(startLat) * Math.sin(startLon) + B * Math.cos(endLat) * Math.sin(endLon);
    const z = A * Math.sin(startLat) + B * Math.sin(endLat);
    const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    const lon = Math.atan2(y, x);
    points.push([lat * 180 / Math.PI, lon * 180 / Math.PI]);
  }
  return points;
}
