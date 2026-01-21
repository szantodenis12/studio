
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

export const roomData: Room[] = [
  {
    id: 'room-double',
    type: 'double',
    price: 435,
    details: {
      ro: {
        title: "Cameră Dublă Standard",
        description: "Perfectă pentru cupluri, oferă confort și o priveliște superbă asupra orașului. Un spațiu elegant și primitor.",
        price: "de la 435 RON / noapte"
      },
      en: {
        title: "Standard Double Room",
        description: "Perfect for couples, offering comfort and a superb city view. An elegant and welcoming space.",
        price: "from 435 RON / night"
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
      { icon: 'Square', text: '23 m²' },
      { icon: 'Users', text: 'Max 2 oaspeți' },
    ],
    images: ['room-1-a', 'room-1-b']
  },
  {
    id: 'room-deluxe',
    type: 'deluxe',
    price: 450,
    details: {
      ro: {
        title: "Cameră Dublă Deluxe",
        description: "Spațiu generos, design modern și facilități premium pentru un sejur de lux. Ideal pentru familii sau oaspeți pretențioși.",
        price: "de la 450 RON / noapte"
      },
      en: {
        title: "Deluxe Double Room",
        description: "Generous space, modern design, and premium facilities for a luxury stay. Ideal for families or discerning guests.",
        price: "from 450 RON / night"
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
      { icon: 'Square', text: '24 m²' },
      { icon: 'Users', text: 'Max 2 oaspeți' },
    ],
    images: ['room-2-a', 'room-2-c']
  },
    {
    id: 'room-single-standard',
    type: 'single-standard',
    price: 300,
    details: {
      ro: {
        title: "Cameră Single Standard",
        description: "Confortabilă și eficientă, perfectă pentru călătorii solo. Oferă toate facilitățile necesare pentru un sejur plăcut.",
        price: "de la 300 RON / noapte"
      },
      en: {
        title: "Standard Single Room",
        description: "Comfortable and efficient, perfect for solo travelers. It offers all the necessary amenities for a pleasant stay.",
        price: "from 300 RON / night"
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
      { icon: 'Square', text: '18 m²' },
      { icon: 'User', text: 'Max 1 oaspete' },
    ],
    images: ['single-standard-a', 'single-standard-b']
  },
  {
    id: 'room-single-deluxe',
    type: 'single-deluxe',
    price: 330,
    details: {
      ro: {
        title: "Cameră Single Deluxe",
        description: "Eleganță și spațiu suplimentar pentru o experiență de neuitat. Bucurați-vă de finisaje superioare și confort sporit.",
        price: "de la 330 RON / noapte"
      },
      en: {
        title: "Deluxe Single Room",
        description: "Elegance and extra space for an unforgettable experience. Enjoy superior finishes and enhanced comfort.",
        price: "from 330 RON / night"
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
        icon: 'Coffee',
        ro: { text: 'Espressor cafea' },
        en: { text: 'Coffee Maker' }
      },
      {
        icon: 'Wind',
        ro: { text: 'Climatizare' },
        en: { text: 'Air Conditioning' }
      },
    ],
    specs: [
      { icon: 'Square', text: '20 m²' },
      { icon: 'User', text: 'Max 1 oaspete' },
    ],
    images: ['single-deluxe-a', 'single-deluxe-b']
  },
  {
    id: 'room-triple',
    type: 'triple',
    price: 720,
    details: {
      ro: {
        title: "Cameră Triplă",
        description: "Ideală pentru grupuri mici sau familii, combinând funcționalitatea cu stilul și confortul necesar după o zi plină.",
        price: "de la 720 RON / noapte"
      },
      en: {
        title: "Triple Room",
        description: "Ideal for small groups or families, combining functionality with the style and comfort needed after a busy day.",
        price: "from 720 RON / night"
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
      { icon: 'Square', text: '23 m²' },
      { icon: 'Users', 'text': 'Max 3 oaspeți' },
    ],
    images: ['room-3-a', 'room-3-b']
  },
  {
    id: 'room-apartment',
    type: 'apartment',
    price: 567,
    details: {
      ro: {
        title: "Apartament cu 1 camera",
        description: "Un apartament spațios și luxos, dotat cu jacuzzi privat, ideal pentru o evadare romantică sau un sejur de neuitat.",
        price: "de la 567 RON / noapte"
      },
      en: {
        title: "One-Room Apartment",
        description: "A spacious and luxurious apartment, equipped with a private jacuzzi, ideal for a romantic getaway or an unforgettable stay.",
        price: "from 567 RON / night"
      }
    },
    amenities: [
      {
        icon: 'Wifi',
        ro: { text: 'Wi-Fi Gratuit' },
        en: { text: 'Free Wi-Fi' }
      },
      {
        icon: 'Wind',
        ro: { text: 'Aer condiționat' },
        en: { text: 'Air Conditioning' }
      },
       {
        icon: 'Bath', // Assuming 'Bath' icon represents Jacuzzi
        ro: { text: 'Jacuzzi' },
        en: { text: 'Jacuzzi' }
      },
      {
        icon: 'Tv',
        ro: { text: 'TV cu ecran plat' },
        en: { text: 'Flat Screen TV' }
      },
    ],
     specs: [
      { icon: 'Square', text: '34 m²' },
      { icon: 'Users', text: 'Max 2 oaspeți' },
    ],
    images: ['apartment-main', 'apartment-jacuzzi']
  }
];
