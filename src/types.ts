export interface Reservation {
  firstName: string;
  lastName: string;
  phone: string;
  password: string; 
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
  ownerId: string; // Korisničko ime admina koji je kreirao event
}

export interface AppState {
  events: EventData[];
  isAdmin: boolean;
  currentAdmin: AdminUser | null;
}