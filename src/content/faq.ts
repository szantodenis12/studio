// Source data for the /intrebari-frecvente page + the FAQPage schema (GEO).
// Every answer is a fact confirmed by the hotel (04.09.2026) or shown on the
// live site (06.10.2026). Do not add new questions without confirming the
// underlying fact with the hotel first.

export type Intrebare = { intrebare: string; raspuns: string };

export const FAQ: Intrebare[] = [
  {
    intrebare: 'Unde este Hotel Maxim Oradea?',
    raspuns: 'Hotel Maxim este pe Strada Victor Babeș 5, Oradea 410141, județul Bihor.',
  },
  {
    intrebare: 'La ce distanță este Hotel Maxim de centrul istoric?',
    raspuns:
      'Hotel Maxim este la 1,1 km de centrul istoric al Oradiei, aproximativ 10 minute pe jos.',
  },
  {
    intrebare: 'Care este telefonul pentru rezervări?',
    raspuns:
      'Telefonul pentru rezervări la Hotel Maxim Oradea este 0771 014 506. Același număr se folosește și pentru rezervări la restaurant sau pentru oferte de evenimente.',
  },
  {
    intrebare: 'Care este tariful de pornire pentru cazare?',
    raspuns:
      'Tariful de pornire afișat pe site este de la 300 RON/noapte pentru Camera Single Standard. Taxa locală de 3% se achită separat la check-in.',
  },
  {
    intrebare: 'Ce tipuri de camere are Hotel Maxim?',
    raspuns:
      'Cameră Single Standard, Cameră Single Deluxe, Cameră Dublă Standard, Cameră Dublă Deluxe, Cameră Triplă și Apartament cu 1 cameră (500-550 RON/noapte).',
  },
  {
    intrebare: 'La ce ore se servește micul dejun?',
    raspuns: 'Micul dejun se servește zilnic între 7:00 și 10:00.',
  },
  {
    intrebare: 'Hotel Maxim are piscină interioară?',
    raspuns: 'Da. Hotel Maxim are piscină interioară încălzită, deschisă până la ora 22:00.',
  },
  {
    intrebare: 'Ce saună are Hotel Maxim?',
    raspuns:
      'Hotel Maxim are saună uscată. Accesul la saună se plătește separat, 50 RON pentru 30 de minute, și nu este inclus în tariful de cazare.',
  },
  {
    intrebare: 'Se poate intra la piscină și spa fără cazare?',
    raspuns:
      'Da. Tarifele afișate pe site pentru vizitatori: acces general 70 RON adulți și 45 RON copii pe zi, fitness 50 RON, saună 50 RON pentru 30 de minute.',
  },
  {
    intrebare: 'Hotelul are parcare?',
    raspuns:
      'Da, parcarea este gratuită, subterană și supraterană, cu număr limitat de locuri. Parcarea pe stradă este contra cost.',
  },
  {
    intrebare: 'Restaurantul este deschis și pentru cei care nu sunt cazați?',
    raspuns: 'Da. Restaurantul Hotel Maxim este deschis publicului. Rezervări la 0771 014 506.',
  },
  {
    intrebare: 'Ce săli de conferințe are Hotel Maxim?',
    raspuns:
      'Hotel Maxim are 3 săli de meeting și o sală de conferințe, cu capacități între 16 și 100 de locuri. Sălile au Wi-Fi, videoproiector, ecran de proiecție și flipchart, plus pachete de coffee break.',
  },
  {
    intrebare: 'Hotelul oferă transfer de la aeroport?',
    raspuns: 'Nu, Hotel Maxim nu oferă transfer de la aeroport.',
  },
];
