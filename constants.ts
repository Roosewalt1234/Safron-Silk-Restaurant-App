
import { MenuItem, Table, Review } from './types';

export const MENU_ITEMS: MenuItem[] = [
  // --- STARTERS / APPETIZERS (VEG) ---
  {
    id: 'v-start-1',
    name: 'Vegetable Samosa',
    description: 'Crispy pastry filled with spiced potatoes and peas.',
    price: 15.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1601050633647-81a317577a36?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Crispy'],
    spiceLevel: 1
  },
  {
    id: 'v-start-2',
    name: 'Onion Pakora / Bhaji',
    description: 'Crispy onion fritters deep-fried with chickpea flour and spices.',
    price: 18.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Fried'],
    spiceLevel: 1
  },
  {
    id: 'v-start-3',
    name: 'Paneer Pakora',
    description: 'Soft paneer cubes dipped in spiced batter and golden fried.',
    price: 25.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1630343710506-89f8b9f21d31?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Protein'],
    spiceLevel: 1
  },
  {
    id: 'v-start-4',
    name: 'Gobi 65',
    description: 'Cauliflower florets marinated in a spicy yogurt-based red masala.',
    price: 24.00,
    cuisine: 'South Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Spicy'],
    spiceLevel: 2
  },
  {
    id: 'v-start-5',
    name: 'Chilli Paneer (Dry/Gravy)',
    description: 'Indo-Chinese fusion paneer tossed with bell peppers and soy-chilli sauce.',
    price: 32.00,
    cuisine: 'Chinese',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Fusion'],
    spiceLevel: 2
  },

  // --- STARTERS / APPETIZERS (NON-VEG) ---
  {
    id: 'nv-start-1',
    name: 'Chicken 65',
    description: 'Spicy, deep-fried chicken pieces with ginger, garlic, and red chillies.',
    price: 32.00,
    cuisine: 'South Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    tags: ['Non-Veg', 'Spicy', 'Bestseller'],
    spiceLevel: 3
  },
  {
    id: 'nv-start-2',
    name: 'Chicken Tikka',
    description: 'Boneless chicken chunks marinated in yogurt and spices, roasted in tandoor.',
    price: 38.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80',
    tags: ['Non-Veg', 'Tandoori'],
    spiceLevel: 1
  },
  {
    id: 'nv-start-3',
    name: 'Tandoori Chicken (Half)',
    description: 'Classic bone-in chicken marinated in traditional spices and grilled.',
    price: 35.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    tags: ['Non-Veg', 'Tandoori'],
    spiceLevel: 2
  },

  // --- SOUTH INDIAN MAIN COURSE (VEG) ---
  {
    id: 'si-main-1',
    name: 'Sambar Rice',
    description: 'Comforting rice cooked with pigeon peas, vegetables, and tamarind.',
    price: 22.00,
    cuisine: 'South Indian',
    meal: ['Lunch'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Healthy'],
    spiceLevel: 1
  },
  {
    id: 'si-main-2',
    name: 'Curd Rice',
    description: 'Rice mixed with yogurt and tempered with mustard seeds and curry leaves.',
    price: 18.00,
    cuisine: 'South Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Cooling'],
    spiceLevel: 0
  },
  {
    id: 'si-main-3',
    name: 'Lemon Rice',
    description: 'Tangy and nutty yellow rice seasoned with fresh lemon juice and peanuts.',
    price: 20.00,
    cuisine: 'South Indian',
    meal: ['Lunch'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Zesty'],
    spiceLevel: 1
  },

  // --- NORTH INDIAN MAIN COURSE (VEG) ---
  {
    id: 'ni-main-1',
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese in a creamy tomato and cashew nut gravy.',
    price: 35.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Creamy', 'Classic'],
    spiceLevel: 1
  },
  {
    id: 'ni-main-2',
    name: 'Dal Tadka',
    description: 'Yellow lentils cooked with onions, tomatoes and tempered with garlic.',
    price: 26.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Healthy'],
    spiceLevel: 1
  },
  {
    id: 'ni-main-3',
    name: 'Dal Makhani',
    description: 'Black lentils and kidney beans slow-cooked with cream and butter.',
    price: 32.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Rich'],
    spiceLevel: 1
  },
  {
    id: 'ni-main-4',
    name: 'Palak Paneer',
    description: 'Paneer cubes in a savory and healthy spinach puree.',
    price: 34.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1603894584134-f1c2baee4ef2?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Healthy'],
    spiceLevel: 1
  },
  {
    id: 'ni-main-5',
    name: 'Chole Masala',
    description: 'Spicy chickpeas cooked in a thick onion-tomato gravy.',
    price: 28.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Spicy'],
    spiceLevel: 2
  },

  // --- NORTH INDIAN MAIN COURSE (NON-VEG) ---
  {
    id: 'nv-main-1',
    name: 'Butter Chicken',
    description: 'Tandoori chicken in a smooth, sweet, and creamy tomato-based gravy.',
    price: 45.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
    tags: ['Non-Veg', 'Iconic', 'Bestseller'],
    spiceLevel: 1
  },
  {
    id: 'nv-main-2',
    name: 'Chicken Kadai',
    description: 'Chicken cooked with bell peppers, onions, and freshly ground spices.',
    price: 42.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1603894584134-f1c2baee4ef2?auto=format&fit=crop&w=800&q=80',
    tags: ['Non-Veg', 'Spicy'],
    spiceLevel: 2
  },
  {
    id: 'nv-main-3',
    name: 'Mutton Rogan Josh',
    description: 'Classic lamb curry with intense flavors of ginger, garlic, and Kashmiri chillies.',
    price: 55.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1548940740-204726a19db3?auto=format&fit=crop&w=800&q=80',
    tags: ['Non-Veg', 'Rich'],
    spiceLevel: 2
  },

  // --- RICE & BIRYANI ---
  {
    id: 'rice-1',
    name: 'Steamed Rice',
    description: 'Plain, fluffy steamed basmati rice.',
    price: 12.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Side'],
    spiceLevel: 0
  },
  {
    id: 'rice-2',
    name: 'Jeera Rice',
    description: 'Basmati rice flavored with cumin seeds and ghee.',
    price: 18.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Aromatic'],
    spiceLevel: 0
  },
  {
    id: 'biryani-1',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice layered with spiced chicken and cooked on dum.',
    price: 40.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ef4a4f8?auto=format&fit=crop&w=800&q=80',
    tags: ['Non-Veg', 'Authentic'],
    spiceLevel: 2
  },
  {
    id: 'biryani-2',
    name: 'Mutton Biryani',
    description: 'Tender mutton pieces cooked with fragrant spices and long-grain rice.',
    price: 50.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ef4a4f8?auto=format&fit=crop&w=800&q=80',
    tags: ['Non-Veg', 'Deluxe'],
    spiceLevel: 2
  },

  // --- INDIAN BREADS ---
  {
    id: 'bread-1',
    name: 'Butter Roti',
    description: 'Whole wheat flour bread cooked in tandoor and glazed with butter.',
    price: 6.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1601303584126-2674f6739bc0?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Side'],
    spiceLevel: 0
  },
  {
    id: 'bread-2',
    name: 'Butter Naan',
    description: 'Leavened bread made with refined flour and glazed with butter.',
    price: 8.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1601303584126-2674f6739bc0?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Side'],
    spiceLevel: 0
  },
  {
    id: 'bread-3',
    name: 'Garlic Naan',
    description: 'Soft tandoori bread flavored with minced garlic and butter.',
    price: 10.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1601303584126-2674f6739bc0?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Flavorful'],
    spiceLevel: 0
  },
  {
    id: 'bread-4',
    name: 'Cheese Naan',
    description: 'A UAE bestseller! Naan stuffed with melting cheddar cheese.',
    price: 15.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Bestseller'],
    spiceLevel: 0
  },

  // --- THALI & COMBO MEALS ---
  {
    id: 'thali-1',
    name: 'Veg Thali',
    description: 'Complete meal with rice, roti, dal, 2 veg curries, curd, and sweet.',
    price: 35.00,
    cuisine: 'North Indian',
    meal: ['Lunch'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Platter'],
    spiceLevel: 1
  },
  {
    id: 'thali-2',
    name: 'Chicken Thali',
    description: 'Complete meal with rice, roti, dal, chicken curry, curd, and sweet.',
    price: 45.00,
    cuisine: 'North Indian',
    meal: ['Lunch'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    tags: ['Non-Veg', 'Platter'],
    spiceLevel: 1
  },

  // --- DESSERTS ---
  {
    id: 'dessert-1',
    name: 'Gulab Jamun (2 pcs)',
    description: 'Classic milk solid dumplings soaked in sugar syrup.',
    price: 12.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Sweet'],
    spiceLevel: 0
  },
  {
    id: 'dessert-2',
    name: 'Rasgulla',
    description: 'Soft and spongy cottage cheese balls in light syrup.',
    price: 12.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Sweet'],
    spiceLevel: 0
  },
  {
    id: 'dessert-3',
    name: 'Gajar Halwa',
    description: 'Grated carrot pudding cooked with milk and nuts.',
    price: 15.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tags: ['Veg', 'Traditional'],
    spiceLevel: 0
  },

  // --- BEVERAGES ---
  {
    id: 'bev-1',
    name: 'Masala Tea',
    description: 'Indian milk tea brewed with cardamom and ginger.',
    price: 8.00,
    cuisine: 'North Indian',
    meal: ['Breakfast', 'Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=800&q=80',
    tags: ['Hot', 'Aromatic'],
    spiceLevel: 0
  },
  {
    id: 'bev-2',
    name: 'Mango Lassi',
    description: 'Refreshing yogurt drink blended with mango pulp.',
    price: 15.00,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    tags: ['Cold', 'Sweet'],
    spiceLevel: 0
  }
];

export const INITIAL_TABLES: Table[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  seats: i % 3 === 0 ? 4 : (i % 2 === 0 ? 2 : 6),
  status: Math.random() > 0.8 ? 'occupied' : 'available',
  position: { x: (i % 5) * 100, y: Math.floor(i / 5) * 100 }
}));

export const REVIEWS: Review[] = [
  { id: 'r1', dishId: 'nv-main-1', user: 'Ahmed Ali', rating: 5, comment: 'The Butter Chicken is world-class. Perfectly creamy.', date: '2023-10-15' },
  { id: 'r2', dishId: 'biryani-1', user: 'Sarah Khan', rating: 5, comment: 'Authentic taste. The spices are just right.', date: '2023-11-12' },
  { id: 'r3', dishId: 'bread-4', user: 'John Doe', rating: 5, comment: 'Best Cheese Naan in Dubai DIFC!', date: '2024-01-05' }
];
