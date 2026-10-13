import { roomData } from '@/lib/room-data';
import { roomInventory } from '@/lib/room-inventory';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { RoomDoc } from './types';

/**
 * The room catalogue as it was hardcoded in the site (room-data.ts +
 * room-inventory.ts + placeholder-images.json), converted to the Firestore
 * `rooms/{type}` shape. Used to:
 *  - seed Firestore from the admin ("Importă datele actuale ale site-ului");
 *  - render the public pages if Firestore is empty or unreachable.
 */

function autoLabel(price: number, locale: 'ro' | 'en') {
  return locale === 'ro' ? `de la ${price} RON / noapte` : `from ${price} RON / night`;
}

function maxGuestsFromSpecs(specs: { text: string }[]): number {
  for (const s of specs) {
    const m = s.text.match(/max\s*(\d+)/i);
    if (m) return Number(m[1]);
  }
  return 2;
}

export function buildStaticRooms(): RoomDoc[] {
  const rooms: RoomDoc[] = roomData.map((room, index) => {
    const images = room.images
      .map((id) => PlaceHolderImages.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({ url: p.imageUrl, alt: p.description }));

    const details = {
      ro: {
        title: room.details.ro.title,
        description: room.details.ro.description,
        // Only keep the original price text when it isn't what the site would
        // generate automatically (e.g. the apartment's "500-550" range).
        priceLabel: room.details.ro.price === autoLabel(room.price, 'ro') ? '' : room.details.ro.price,
      },
      en: {
        title: room.details.en.title,
        description: room.details.en.description,
        priceLabel: room.details.en.price === autoLabel(room.price, 'en') ? '' : room.details.en.price,
      },
    };

    return {
      type: room.type,
      slug: room.id,
      order: index,
      active: true,
      totalRooms: roomInventory[room.type] ?? 0,
      maxGuests: maxGuestsFromSpecs(room.specs),
      basePrice: room.price,
      priceOverrides: [],
      details,
      amenities: room.amenities.map((a) => ({ icon: a.icon, ro: a.ro.text, en: a.en.text })),
      specs: room.specs.map((s) => ({ icon: s.icon, text: s.text })),
      images,
      updatedAt: null,
    };
  });

  // Room types that exist in the inventory (and in admin dropdowns) but have
  // no public content yet -- seeded inactive with no price.
  const known = new Set(rooms.map((r) => r.type));
  Object.entries(roomInventory).forEach(([type, count]) => {
    if (known.has(type)) return;
    const template = rooms.find((r) => r.type === 'double') ?? rooms[0];
    rooms.push({
      type,
      slug: `room-${type}`,
      order: rooms.length,
      active: false,
      totalRooms: count,
      maxGuests: 2,
      basePrice: 0,
      priceOverrides: [],
      details: {
        ro: { title: type === 'double-balcony' ? 'Cameră Dublă cu Balcon' : type, description: '', priceLabel: '' },
        en: { title: type === 'double-balcony' ? 'Double Room with Balcony' : type, description: '', priceLabel: '' },
      },
      amenities: template ? template.amenities.map((a) => ({ ...a })) : [],
      specs: [{ icon: 'Users', text: 'Max 2 oaspeți' }],
      images: [],
      updatedAt: null,
    });
  });

  return rooms;
}

/** Static catalogue, computed once. */
export const STATIC_ROOMS: RoomDoc[] = buildStaticRooms();
