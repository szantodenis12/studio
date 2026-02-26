
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
  { icon: 'ShieldCheck', ro: { text: 'Seif (dim. laptop)' }, en: { text: 'Safe (laptop size)' } },
  { icon: 'Refrigerator', ro: { text: 'Minibar' }, en: { text: 'Minibar' } },
  { icon: 'Tv', ro: { text: 'TV LCD' }, en: { text: 'LCD TV' } },
  { icon: 'Wifi', ro: { text: 'Internet de mare viteză' }, en: { text: 'High-speed Internet' } },
  { icon: 'Thermometer', ro: { text: 'Climatizare individuală' }, en: { text: 'Individual A/C' } },
  { icon: 'ShowerHead', ro: { text: 'Baie cu duș' }, en: { text: 'Bathroom with shower' } },
  { icon: 'Wind', ro: { text: 'Uscător de păr' }, en: { text: 'Hairdryer' } },
  { icon: 'ConciergeBell', ro: { text: 'Room service' }, en: { text: 'Room Service' } },
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
    images: ['single-standard-a', 'single-standard-b', 'single-standard-c', 'room-1-c']
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
    images: ['single-deluxe-a', 'single-deluxe-b', 'room-1-c']
  },
  {
    id: 'room-double',
    type: 'double',
    price: 390,
    details: {
      ro: {
        title: "Cameră Dublă Standard",
        description: "Cameră în stil clasic, cu pat matrimonial, birou și baie cu duș. Vedere către terasa interioară sau către Str. Victor Babeș.",
        price: "de la 390 RON / noapte"
      },
      en: {
        title: "Standard Double Room",
        description: "Classic style room with a double bed, desk, and bathroom with shower. View towards the inner terrace or Victor Babeș Street.",
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
        description: "Variantă dublă poziționată superior în ofertă, pentru sejururi în care confortul extins contează (business, cupluri, sejururi de weekend).",
        price: "de la 420 RON / noapte"
      },
      en: {
        title: "Deluxe Double Room",
        description: "A superior double room option, for stays where extended comfort matters (business, couples, weekend getaways).",
        price: "from 420 RON / night"
      }
    },
    amenities: standardAmenities,
     specs: [
      { icon: 'Square', text: '24 m²' },
      { icon: 'Users', text: 'Max 2 oaspeți' },
    ],
    images: ['room-2-a', 'room-2-c', 'room-2-b', 'room-1-d']
  },
  {
    id: 'room-triple',
    type: 'triple',
    price: 550,
    details: {
      ro: {
        title: "Cameră Triplă",
        description: "Configurație pentru 3 persoane (familie/grup restrâns), cu accent pe funcționalitate: spațiu de lucru, internet, climatizare și servicii de bază la același standard.",
        price: "de la 550 RON / noapte"
      },
      en: {
        title: "Triple Room",
        description: "Configuration for 3 people (family/small group), with an emphasis on functionality: workspace, internet, air conditioning, and basic services at the same standard.",
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
        description: "Opțiune pentru sejururi mai lungi sau confort extins. Recomandat pentru oaspeți care au nevoie de spațiu separat pentru relaxare și lucru.",
        price: "de la 500-550 RON / noapte"
      },
      en: {
        title: "One-Room Apartment",
        description: "An option for longer stays or extended comfort. Recommended for guests who need separate space for relaxation and work.",
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
    images: ['apartment-main', 'apartment-jacuzzi', 'apartment-c']
  }
];
