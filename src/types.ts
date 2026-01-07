export interface Reservation {
  firstName: string;
  lastName: string;
  phone: string;
  password: string; 
  reservedAt: string; // ISO timestamp
  ticketSerials?: number[]; // Niz od 4 broja
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

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  isMain: boolean;
}

export interface EventData {
  id: string;
  title: string;
  date: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  floorPlanImages?: string[];
  tables: Table[];
  isHidden?: boolean;
  ownerId: string;
  minTicketSerial: number; // Privatno za admina
  maxTicketSerial: number; // Privatno za admina
}

export interface AppState {
  events: EventData[];
  isAdmin: boolean;
  currentAdmin: AdminUser | null;
}