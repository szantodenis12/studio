
export type RoomDetails = {
  [locale: string]: {
    title: string;
    description: string;
    price: string;
  };
};

export type Room = {
  id: string;
  type: 'single-standard' | 'single-deluxe' | 'double' | 'deluxe' | 'apartment' | 'triple';
  details: RoomDetails;
  amenities: {
    icon: string; // Storing icon name as string for simplicity
    [locale: string]: {
      text: string;
    };
  }[];
  specs: {
    icon: string;
    text: string;
  }[];
  price: number;
  images: string[]; // image IDs from placeholder-images.json
};

const standardAmenities = [
  { icon: 'CreditCard', ro: { text: 'Acces cu cartelă' }, en: { text: 'Card Access' } },
  { icon: 'Briefcase', ro: { text: 'Birou de lucru' }, en: { text: 'Work Desk' } },
  { icon: 'Safe', ro: { text: 'Seif (dim. laptop)' }, en: { text: 'Safe (laptop size)' } },
  { icon: 'Refrigerator', ro: { text: 'Minibar' }, en: { text: 'Minibar' } },
  { icon: 'Tv', ro: { text: 'TV LCD' }, en: { text: 'LCD TV' } },
  { icon: 'Wifi', ro: { text: 'Internet de mare viteză' }, en: { text: 'High-speed Internet' } },
  { icon: 'Thermometer', ro: { text: 'Climatizare individuală' }, en: { text: 'Individual A/C' } },
  { icon: 'ShowerHead', ro: { text: 'Baie cu duș' }, en: { text: 'Bathroom with shower' } },
  { icon: 'Wind', ro: { text: 'Uscător de păr' }, en: { text: 'Hairdryer' } },
];

export const roomData: Room[] = [
  {
    id: 'room-single-standard',
    type: 'single-standard',
    price: 300,
    details: {
      ro: {
        title: "Cameră Single Standard",
        description: "Configurație pentru ocupare single, orientată pe funcționalitate: spațiu de lucru, conectivitate și control individual al temperaturii.",
        price: "de la 300 RON / noapte"
      },
      en: {
        title: "Standard Single Room",
        description: "Configuration for single occupancy, focused on functionality: workspace, connectivity, and individual temperature control.",
        price: "from 300 RON / night"
      }
    },
    amenities: standardAmenities,
    specs: [
      { icon: 'Square', text: '18 m²' },
      { icon: 'User', text: 'Max 1 oaspete' },
    ],
    images: ['single-standard-a', 'single-standard-b', 'single-standard-c', 'single-standard-d']
  },
  {
    id: 'room-single-deluxe',
    type: 'single-deluxe',
    price: 330,
    details: {
      ro: {
        title: "Cameră Single Deluxe",
        description: "Varianta single cu poziționare premium în portofoliu, pentru oaspeți care prioritizează confortul la același standard de dotări și conectivitate.",
        price: "de la 330 RON / noapte"
      },
      en: {
        title: "Deluxe Single Room",
        description: "The single room option with premium positioning in our portfolio, for guests who prioritize comfort with the same standard of amenities and connectivity.",
        price: "from 330 RON / night"
      }
    },
    amenities: standardAmenities,
    specs: [
      { icon: 'Square', text: '20 m²' },
      { icon: 'User', text: 'Max 1 oaspete' },
    ],
    images: ['single-deluxe-a', 'single-deluxe-b', 'single-deluxe-c', 'single-deluxe-d']
  },
  {
    id: 'room-double',
    type: 'double',
    price: 390,
    details: {
      ro: {
        title: "Cameră Dublă Standard",
        description: "Perfectă pentru cupluri, oferă confort și o priveliște superbă asupra orașului. Un spațiu elegant și primitor.",
        price: "de la 390 RON / noapte"
      },
      en: {
        title: "Standard Double Room",
        description: "Perfect for couples, offering comfort and a superb city view. An elegant and welcoming space.",
        price: "from 390 RON / night"
      }
    },
    amenities: standardAmenities,
    specs: [
      { icon: 'Square', text: '23 m²' },
      { icon: 'Users', text: 'Max 2 oaspeți' },
    ],
    images: ['room-1-a', 'room-1-b', 'room-1-c', 'room-1-d']
  },
  {
    id: 'room-deluxe',
    type: 'deluxe',
    price: 420,
    details: {
      ro: {
        title: "Cameră Dublă Deluxe",
        description: "Spațiu generos, design modern și facilități premium pentru un sejur de lux. Ideal pentru familii sau oaspeți pretențioși.",
        price: "de la 420 RON / noapte"
      },
      en: {
        title: "Deluxe Double Room",
        description: "Generous space, modern design, and premium facilities for a luxury stay. Ideal for families or discerning guests.",
        price: "from 420 RON / night"
      }
    },
    amenities: standardAmenities,
     specs: [
      { icon: 'Square', text: '24 m²' },
      { icon: 'Users', text: 'Max 2 oaspeți' },
    ],
    images: ['room-2-a', 'room-2-c', 'room-2-b', 'room-2-d']
  },
  {
    id: 'room-triple',
    type: 'triple',
    price: 550,
    details: {
      ro: {
        title: "Cameră Triplă",
        description: "Ideală pentru grupuri mici sau familii, combinând funcționalitatea cu stilul și confortul necesar după o zi plină.",
        price: "de la 550 RON / noapte"
      },
      en: {
        title: "Triple Room",
        description: "Ideal for small groups or families, combining functionality with the style and comfort needed after a busy day.",
        price: "from 550 RON / night"
      }
    },
    amenities: standardAmenities,
     specs: [
      { icon: 'Square', text: '23 m²' },
      { icon: 'Users', 'text': 'Max 3 oaspeți' },
    ],
    images: ['room-3-a', 'room-3-b', 'room-3-c', 'room-3-d']
  },
  {
    id: 'room-apartment',
    type: 'apartment',
    price: 500,
    details: {
      ro: {
        title: "Apartament cu 1 camera",
        description: "Un apartament spațios și luxos, dotat cu jacuzzi privat, ideal pentru o evadare romantică sau un sejur de neuitat.",
        price: "de la 500-550 RON / noapte"
      },
      en: {
        title: "One-Room Apartment",
        description: "A spacious and luxurious apartment, equipped with a private jacuzzi, ideal for a romantic getaway or an unforgettable stay.",
        price: "from 500-550 RON / night"
      }
    },
    amenities: [
      { icon: 'Bath', ro: { text: 'Jacuzzi' }, en: { text: 'Jacuzzi' } },
      ...standardAmenities
    ],
     specs: [
      { icon: 'Square', text: '34 m²' },
      { icon: 'Users', text: 'Max 2 oaspeți' },
    ],
    images: ['apartment-main', 'apartment-jacuzzi', 'apartment-c', 'apartment-d']
  }
];
