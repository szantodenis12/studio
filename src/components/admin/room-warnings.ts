import type { RoomDoc } from '@/lib/rooms/types';

/** Problems an admin should fix before (or while) a room is shown on the site. */
export function roomWarnings(room: RoomDoc): string[] {
  const w: string[] = [];
  if (room.basePrice <= 0) {
    w.push('Camera nu are preț de bază. Setați un preț înainte de activare.');
  }
  if (!room.details.ro.description.trim() || !room.details.en.description.trim()) {
    w.push('Lipsește descrierea (RO și/sau EN). Completați-o înainte de activare.');
  }
  if (room.images.length === 0) {
    w.push('Camera nu are fotografii.');
  }
  if (room.totalRooms <= 0) {
    w.push('Numărul de camere este 0: tipul nu poate fi rezervat.');
  }
  if (!room.active && w.length) {
    w.push('Camera este inactivă (nu apare pe site și nu poate fi rezervată online).');
  }
  return w;
}

/** Blocking problems that prevent activating a room. */
export function activationErrors(room: RoomDoc): string[] {
  const e: string[] = [];
  if (room.basePrice <= 0) e.push('prețul de bază');
  if (!room.details.ro.title.trim() || !room.details.en.title.trim()) e.push('titlul RO/EN');
  if (!room.details.ro.description.trim() || !room.details.en.description.trim()) e.push('descrierea RO/EN');
  return e;
}
