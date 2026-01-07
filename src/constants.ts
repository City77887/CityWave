
import { EventData, TableStatus } from './types';

export const INITIAL_EVENTS: EventData[] = [
  {
    id: 'evt-1',
    ownerId: 'admin',
    title: 'Neon Jazz Večeri',
    date: '2025-11-15T20:00',
    description: 'Doživite lagani ritam jazza pod neonskim svjetlima. Večer soula, saksofona i sofisticiranih pića.',
    longDescription: 'Pridružite nam se na ekskluzivnoj večeri jazza gdje nastupaju najbolji domaći i strani izvođači. Uživajte u vrhunskoj ponudi koktela i opuštenoj atmosferi. Ulaz je besplatan za sve koji rezerviraju stol. Dress code: Smart Casual. Program počinje točno u 20:00 sati, a zabava traje do ranih jutarnjih sati.',
    imageUrl: 'https://picsum.photos/800/400?random=1',
    // Added missing minTicketSerial and maxTicketSerial as required by EventData
    minTicketSerial: 1000,
    maxTicketSerial: 9999,
    tables: [
      { id: 't-1', name: 'VIP 1', status: TableStatus.FREE },
      // Added missing reservedAt as required by Reservation
      { id: 't-2', name: 'VIP 2', status: TableStatus.RESERVED, reservation: { firstName: 'Ivan', lastName: 'Horvat', phone: '091-555-0199', password: 'tajnalozinka', reservedAt: new Date().toISOString() } },
      { id: 't-3', name: 'Stol A', status: TableStatus.FREE },
      { id: 't-4', name: 'Stol B', status: TableStatus.FREE },
      { id: 't-5', name: 'Šank 1', status: TableStatus.FREE },
      { id: 't-6', name: 'Šank 2', status: TableStatus.FREE },
    ],
  },
  {
    id: 'evt-2',
    ownerId: 'admin',
    title: 'CityWave Techno Tulum',
    date: '2025-11-18T22:00',
    description: 'Najveći techno događaj godine. Visoka energija, duboki bas i nezaboravan light show.',
    longDescription: 'Pripremite se za najluđu noć u gradu! CityWave dovodi DJ-eve svjetske klase koji će vas držati na plesnom podiju cijelu noć. Očekujte spektakularan laser show, vrhunsko ozvučenje i posebna iznenađenja tijekom večeri. Preporučujemo ranu rezervaciju jer se mjesta brzo popunjavaju.',
    imageUrl: 'https://picsum.photos/800/400?random=2',
    // Added missing minTicketSerial and maxTicketSerial as required by EventData
    minTicketSerial: 1000,
    maxTicketSerial: 9999,
    tables: [
      { id: 't-1', name: 'Separe 1', status: TableStatus.FREE },
      { id: 't-2', name: 'Separe 2', status: TableStatus.FREE },
      { id: 't-3', name: 'Visoki Stol 1', status: TableStatus.FREE },
      { id: 't-4', name: 'Visoki Stol 2', status: TableStatus.FREE },
    ],
  },
];
