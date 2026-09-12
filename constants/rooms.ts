import type { Dumpling } from '@/types';

// Themed "rooms" the dumplings live in — the collection is an album of little
// themed spaces (inspired by the reference's jar/diorama concept). Existing
// dumpling data is untouched; each dumpling is mapped to a room deterministically
// by its collectionOrder so the assignment is stable across sessions/updates.

export interface Room {
  id: string;
  name: string;
  emoji: string;
  /** Backdrop gradient for the room's "jar" diorama. */
  backdrop: [string, string];
  /** Floor/scene accent. */
  accent: string;
}

export const ROOMS: Room[] = [
  { id: 'kitchen', name: 'Mini Kitchen', emoji: '🍳', backdrop: ['#ffe9c7', '#ffd39b'], accent: '#e8a765' },
  { id: 'hall', name: 'Cozy Hall', emoji: '🛋️', backdrop: ['#ffe0ec', '#ffc2da'], accent: '#ef7aa8' },
  { id: 'bedroom', name: 'Dream Bedroom', emoji: '🛏️', backdrop: ['#e3e7ff', '#c3cbff'], accent: '#8f9bff' },
  { id: 'office', name: 'Work Office', emoji: '💼', backdrop: ['#dff3ea', '#bfe6d6'], accent: '#5bbf95' },
  { id: 'garden', name: 'Sunny Garden', emoji: '🌿', backdrop: ['#e6f7cf', '#cfeeaa'], accent: '#8fc65a' },
  { id: 'cafe', name: 'Little Cafe', emoji: '☕', backdrop: ['#f0e2d6', '#e0c6ae'], accent: '#b98d67' },
];

export function roomForDumpling(d: Dumpling): string {
  return ROOMS[(d.collectionOrder - 1) % ROOMS.length].id;
}

export function getRoom(id: string): Room {
  return ROOMS.find((r) => r.id === id) ?? ROOMS[0];
}
