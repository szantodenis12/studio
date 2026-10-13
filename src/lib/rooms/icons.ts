import {
  Accessibility,
  Baby,
  Bath,
  BedDouble,
  BedSingle,
  Briefcase,
  Car,
  Check,
  CigaretteOff,
  Coffee,
  ConciergeBell,
  CreditCard,
  Dumbbell,
  Fan,
  Lock,
  Maximize,
  Mountain,
  Refrigerator,
  ShieldCheck,
  ShowerHead,
  Sofa,
  Square,
  Sun,
  Thermometer,
  Tv,
  User,
  Users,
  Utensils,
  Waves,
  Wifi,
  Wind,
  type LucideIcon,
} from 'lucide-react';

// Curated map of icon names usable for room amenities/specs (stored by name in
// Firestore). `import * as LucideIcons` would pull the entire icon set into
// the bundle since webpack can't tree-shake a namespace import that's indexed
// dynamically.
export const ROOM_ICONS: Record<string, LucideIcon> = {
  Accessibility,
  Baby,
  Bath,
  BedDouble,
  BedSingle,
  Briefcase,
  Car,
  Check,
  CigaretteOff,
  Coffee,
  ConciergeBell,
  CreditCard,
  Dumbbell,
  Fan,
  Lock,
  Maximize,
  Mountain,
  Refrigerator,
  ShieldCheck,
  ShowerHead,
  Sofa,
  Square,
  Sun,
  Thermometer,
  Tv,
  User,
  Users,
  Utensils,
  Waves,
  Wifi,
  Wind,
};

export const ROOM_ICON_NAMES = Object.keys(ROOM_ICONS);

export function roomIcon(name: string): LucideIcon {
  return ROOM_ICONS[name] || Check;
}
