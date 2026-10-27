export type ExpenseCategory = 
  | 'Flights' 
  | 'Accommodation' 
  | 'Food' 
  | 'Activities' 
  | 'Transit' 
  | 'Shopping' 
  | 'Misc';

export type ChecklistCategory = 
  | 'Clothing' 
  | 'Toiletries' 
  | 'Electronics' 
  | 'Documents' 
  | 'Gear' 
  | 'General';

export type LinkCategory = 
  | 'Booking' 
  | 'Guide' 
  | 'Map' 
  | 'Transit' 
  | 'Reservation' 
  | 'Other';

export interface Activity {
  id: string;
  title: string;
  location: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM or free text
  notes: string;
  estimatedCost: number;
  isCompleted: boolean;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  estimatedCost: number;
  actualCost: number;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  category: ChecklistCategory;
  isPacked: boolean;
}

export interface TravelLink {
  id: string;
  title: string;
  url: string;
  category: LinkCategory;
  notes?: string;
}

export interface TravelNote {
  id: string;
  title: string;
  content: string;
  isPinned?: boolean;
  updatedAt: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  location?: string;
  date?: string;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  notes: string;
  coverImageUrl: string;
  isArchived: boolean;
  createdAt: string;
  activities: Activity[];
  expenses: Expense[];
  checklist: ChecklistItem[];
  links: TravelLink[];
  notesList: TravelNote[];
  photos: PhotoItem[];
}

export type TripFilterTab = 'all' | 'upcoming' | 'ongoing' | 'past' | 'archived';
export type TripDetailTab = 'overview' | 'itinerary' | 'expenses' | 'checklist' | 'utilities' | 'photos';
