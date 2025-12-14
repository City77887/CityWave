export interface Reservation {
  firstName: string;
  lastName: string;
  phone: string;
  password: string; // Stored in plain text as per requirements (Admin needs to see it)
}

export enum TableStatus {
  FREE = 'FREE',
  RESERVED = 'RESERVED'
}

export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  reservation?: Reservation;
}

export interface EventData {
  id: string;
  title: string;
  date: string;
  description: string; // Kratki info za početnu stranicu
  longDescription?: string; // Detaljni opis za gumb "VIŠE INFORMACIJA"
  imageUrl: string;
  floorPlanImages?: string[]; // URLs for 1 or 2 floor plan images
  tables: Table[];
  isHidden?: boolean;
}

export interface AppState {
  events: EventData[];
  isAdmin: boolean;
}