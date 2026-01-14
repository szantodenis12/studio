
export type RoomDetails = {
  [locale: string]: {
    title: string;
    description: string;
    price: string;
  };
};

export type Room = {
  id: string;
  type: 'single' | 'double' | 'deluxe';
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

export const roomData: Room[] = [
  {
    id: 'room-double',
    type: 'double',
    price: 450,
    details: {
      ro: {
        title: "Cameră Dublă Standard",
        description: "Perfectă pentru cupluri, oferă confort și o priveliște superbă asupra orașului. Un spațiu elegant și primitor.",
        price: "de la 450 RON / noapte"
      },
      en: {
        title: "Standard Double Room",
        description: "Perfect for couples, offering comfort and a superb city view. An elegant and welcoming space.",
        price: "from $90 / night"
      }
    },
    amenities: [
      {
        icon: 'Wifi',
        ro: { text: 'Wi-Fi Gratuit' },
        en: { text: 'Free Wi-Fi' }
      },
      {
        icon: 'Tv',
        ro: { text: 'TV cu ecran plat' },
        en: { text: 'Flat Screen TV' }
      },
      {
        icon: 'Wind',
        ro: { text: 'Aer condiționat' },
        en: { text: 'Air Conditioning' }
      },
      {
        icon: 'ShowerHead',
        ro: { text: 'Duș walk-in' },
        en: { text: 'Walk-in Shower' }
      },
    ],
    specs: [
      { icon: 'Square', text: '25 m²' },
      { icon: 'Users', text: 'Max 2 oaspeți' },
    ],
    images: ['room-1-a', 'room-1-b']
  },
  {
    id: 'room-deluxe',
    type: 'deluxe',
    price: 750,
    details: {
      ro: {
        title: "Apartament Deluxe",
        description: "Spațiu generos, design modern și facilități premium pentru un sejur de lux. Ideal pentru familii sau oaspeți pretențioși.",
        price: "de la 750 RON / noapte"
      },
      en: {
        title: "Deluxe Apartment",
        description: "Generous space, modern design, and premium facilities for a luxury stay. Ideal for families or discerning guests.",
        price: "from $150 / night"
      }
    },
    amenities: [
       {
        icon: 'Wifi',
        ro: { text: 'Wi-Fi Gratuit' },
        en: { text: 'Free Wi-Fi' }
      },
      {
        icon: 'Tv',
        ro: { text: 'TV Smart 4K' },
        en: { text: '4K Smart TV' }
      },
      {
        icon: 'Coffee',
        ro: { text: 'Espressor cafea' },
        en: { text: 'Coffee Maker' }
      },
      {
        icon: 'Wind',
        ro: { text: 'Climatizare dual-zone' },
        en: { text: 'Dual-zone AC' }
      },
    ],
     specs: [
      { icon: 'Square', text: '50 m²' },
      { icon: 'Users', text: 'Max 4 oaspeți' },
    ],
    images: ['room-2-a', 'room-2-c']
  },
  {
    id: 'room-single',
    type: 'single',
    price: 380,
    details: {
      ro: {
        title: "Cameră Single",
        description: "Ideală pentru călătorii de afaceri, combinând funcționalitatea cu stilul și confortul necesar după o zi plină.",
        price: "de la 380 RON / noapte"
      },
      en: {
        title: "Single Room",
        description: "Ideal for business travelers, combining functionality with the style and comfort needed after a busy day.",
        price: "from $75 / night"
      }
    },
    amenities: [
      {
        icon: 'Wifi',
        ro: { text: 'Wi-Fi Gratuit' },
        en: { text: 'Free Wi-Fi' }
      },
      {
        icon: 'Tv',
        ro: { text: 'TV cu ecran plat' },
        en: { text: 'Flat Screen TV' }
      },
      {
        icon: 'Wind',
        ro: { text: 'Aer condiționat' },
        en: { text: 'Air Conditioning' }
      },
      {
        icon: 'ShowerHead',
        ro: { text: 'Cabină de duș' },
        en: { text: 'Shower Cabin' }
      },
    ],
     specs: [
      { icon: 'Square', text: '20 m²' },
      { icon: 'Users', text: '1 oaspete' },
    ],
    images: ['room-3-a', 'room-3-b']
  }
];
