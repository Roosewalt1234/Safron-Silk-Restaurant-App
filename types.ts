
export type CuisineType = 'North Indian' | 'South Indian' | 'Chinese' | 'Fusion';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';
export type SpiceLevel = 0 | 1 | 2 | 3; // 0: Mild, 1: Medium, 2: Hot, 3: Extra Hot

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  cuisine: CuisineType;
  meal: MealType[];
  image: string;
  gallery?: string[]; // Multiple images for the carousel
  tags: string[];
  spiceLevel?: SpiceLevel;
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedSpice?: SpiceLevel;
}

export interface Review {
  id: string;
  dishId?: string; // Linked to MenuItem.id
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Table {
  id: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
  position: { x: number; y: number };
}

export interface Reservation {
  id: string;
  tableId: number;
  name: string;
  phone: string; // Added for UAE localization
  date: string;
  time: string;
  guests: number;
}
